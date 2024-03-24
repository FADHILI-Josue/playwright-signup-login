const props = {
  username: {
    type: 'string',
    minLength: 3,
    errorMessage: {
      minLength: 'Username must be no less than 3 characters',
    },
  },
  email: {
    type: 'string',
    format: 'email',
    errorMessage: {
      format: 'Please provide a valid email address',
    },
  },
  password: {
    type: 'string',
    minLength: 6,
    errorMessage: {
      minLength: 'Password must not be less than 6 characters',
    },
  },
  confirm_password: {
    type: 'string',
    const: { $data: '1/password' },
    errorMessage: {
      const: 'The provided passwords do not match',
    },
  },
};

const signUpSchema = {
  type: 'object',
  properties: {
    username: props.username,
    email: props.email,
    password: props.password,
    confirm_password: props.confirm_password,
  },
  required: ['username', 'email', 'password', 'confirm_password'],
};

const loginSchema = {
  type: 'object',
  properties: {
    email: props.email,
    password: props.password,
  },
  required: ['email', 'password'],
};

export { signUpSchema, loginSchema };
