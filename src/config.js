const port = process.env.PORT || 3000;
const host = process.env.APP_URL || `http://localhost:${port}`;

const appURL = new URL(host);

export { port, host, appURL };
