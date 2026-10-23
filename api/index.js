// Vercel serverless entry point
// We import the Express app from server/src/app.js (not index.js)
const app = require('../server/src/app');

module.exports = app;
