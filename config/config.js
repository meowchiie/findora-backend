require('dotenv').config(); 

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'findora_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'findora_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql'
  },
  test: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME_TEST || 'database_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql'
  },
  production: {
    username: process.env.DB_USERNAME || 'findora_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'findora_db',
    host: process.env.DB_HOST || 'mysql',         // <-- Default ke nama service docker
    dialect: process.env.DB_DIALECT || 'mysql'     // <-- WAJIB ADA / default ke mysql
  }
};