const postgres = require('postgres').default;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL must be configured before importing the Postgres client');
}

const sql = postgres(connectionString);

module.exports = sql;
