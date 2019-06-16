import bluebird from 'bluebird';

const options = {
  // Initialization Options
  promiseLib: bluebird,
};

const pgp = require('pg-promise')(options);
const connectionString = 'postgres://localhost:5432/language_learning';
const db = pgp(connectionString);

export default db;
