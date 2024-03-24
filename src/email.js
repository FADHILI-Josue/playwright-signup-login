import nodemailer from 'nodemailer';
import { host } from './config.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

async function sendEmail(username, email) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"Demo App" <${process.env.GMAIL_USER}>`, // sender address
    to: email,
    subject: 'Confirm your email address',
    text: `Hello ${username},

Thaan you for registering an account on Demo App. 

Before being able to use your account you need to verify that this is your email address by clicking here: ${host}/email-verification?email=${email}

Kind Regards, 
Demo
`, // plain text body
    html: ` <p>Hello ${username},</p>
    <p>Thank you for registering an account on Demo App.</p>
    <p>Before being able to use your account you need to verify that this is your email address by <a href="${host}/email-verification?email=${email}">confirming your account</a>.</p>
    <p>Kind Regards,</p>
    <p>Demo App Admin</p>
`,
  });
}

export { sendEmail };
