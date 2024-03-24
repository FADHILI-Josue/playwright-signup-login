import 'dotenv/config';
import Fastify from 'fastify';
import pug from 'pug';
import fastifyView from '@fastify/view';
import fastifyFormbody from '@fastify/formbody';
import ajvErrors from 'ajv-errors';
import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import * as url from 'node:url';
import { signUpSchema, loginSchema } from './schema.js';
import { sendEmail } from './email.js';
import { UserManager } from './user.js';
import { port, appURL } from './config.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const views = path.join(__dirname, 'templates');

const fastify = Fastify({
  logger: true,
  requestTimeout: 30000,
  ajv: {
    customOptions: {
      // Warning: Enabling this option may lead to this security issue https://www.cvedetails.com/cve/CVE-2020-8192/
      allErrors: true,
      $data: true,
    },
    plugins: [ajvErrors],
  },
});

fastify.register(fastifyCookie, {
  hook: 'onRequest',
});

fastify.register(fastifyView, {
  engine: {
    pug,
  },
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public/'),
});

fastify.register(fastifyFormbody);

fastify.get('/email-verification', (req, reply) => {
  const { email } = req.query;

  if (!email) {
    return reply.status(400).type('text/html').send(`<h1>Email not found</h1>`);
  }

  UserManager.verifyUser(email);

  reply.type('text/html').send(
    `<h1>Your email, <span style="color:blue;">${email}</span>, is verified successfully!</h1>

  <p><a href="/login">You may now login</a></p>
`
  );
});

fastify.get('/dashboard', (req, reply) => {
  const signedIn = req.cookies.signedIn;
  if (!signedIn) {
    return reply.redirect(303, '/login');
  }

  reply.view('./src/templates/dashboard.pug', {
    title: 'Dashboard',
  });
});

fastify.get('/login', (req, reply) => {
  const signedIn = req.cookies.signedIn;
  if (signedIn) {
    return reply.redirect(303, '/dashboard');
  }

  reply.view('./src/templates/login.pug', { title: 'Log in' });
});

fastify.post(
  '/login',
  {
    schema: {
      body: loginSchema,
    },
    attachValidation: true,
  },
  async (req, reply) => {
    const { email, password } = req.body;

    if (req.validationError) {
      const error = req.validationError;
      const data = {
        title: 'Login in',
        errors: error.validation.map((err) => {
          return {
            key: err.instancePath.substring(1),
            value: err.message,
          };
        }),
      };

      return reply.status(400).view('./src/templates/login.pug', data);
    }

    const foundUser = UserManager.findUser(email);

    if (foundUser.password !== password) {
      throw new Erorr('Email or password is incorrect');
    }

    if (!foundUser.isVerified) {
      throw new Erorr('Ensure to verify your email first before logging in');
    }

    reply
      .setCookie('signedIn', 'true', {
        domain: appURL.hostname,
        path: '/',
        maxAge: 3600,
      })
      .redirect(303, '/dashboard');
  }
);

fastify.get('/logout', (req, reply) => {
  reply
    .clearCookie('signedIn', {
      domain: appURL.hostname,
      path: '/',
    })
    .redirect(303, '/login');
});

fastify.get('/signup', (req, reply) => {
  const signedIn = req.cookies.signedIn;
  if (signedIn) {
    return reply.redirect(303, '/dashboard');
  }

  reply.view('./src/templates/signup.pug', {
    title: 'Sign Up',
  });
});

fastify.post(
  '/signup',
  {
    schema: {
      body: signUpSchema,
    },
    attachValidation: true,
  },
  async (req, reply) => {
    const { username, email, password } = req.body;

    if (req.validationError) {
      const error = req.validationError;
      const data = {
        title: 'Sign Up',
        errors: error.validation.map((err) => {
          return {
            key: err.instancePath.substring(1),
            value: err.message,
          };
        }),
      };

      return reply.status(400).view('./src/templates/signup.pug', data);
    }

    const newUser = UserManager.createUser({
      username,
      email,
      password,
    });

    await sendEmail(username, email);

    return reply.status(200).view('./src/templates/confirm-email.pug', {
      email,
    });
  }
);

fastify.get('/', (req, reply) => {
  reply.view('./src/templates/index.pug', { title: 'Welcome' });
});

fastify.listen({ port }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  fastify.log.info(`Fastify is listening on port: ${address}`);
});
