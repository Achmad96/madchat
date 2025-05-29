require('dotenv').config();

const DatabaseConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  port: process.env.DATABASE_PORT || 3306,
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'madchat'
};

module.exports = DatabaseConfig;
