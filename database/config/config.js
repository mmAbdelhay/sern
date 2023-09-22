require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME_DEV,
    password: process.env.DB_PASSWORD_DEV,
    database: process.env.DB_DATABASE_DEV,
    host: process.env.DB_HOST_DEV,
    port: process.env.DB_PORT_DEV,
    dialect: process.env.DB_DIALECT,
  },
  test: {
    username: process.env.DB_USERNAME_TEST,
    password: process.env.DB_PASSWORD_TEST,
    database: process.env.DB_DATABASE_TEST,
    host: process.env.DB_HOST_TEST,
    port: process.env.DB_PORT_TEST,
    dialect: process.env.DB_DIALECT,
  },
  production: {
    username: process.env.DB_USERNAME_PRODUCTION,
    password: process.env.DB_PASSWORD_PRODUCTION,
    database: process.env.DB_NAME_PRODUCTION,
    host: process.env.DB_HOSTNAME_PRODUCTION,
    port: process.env.DB_PORT_PRODUCTION,
    dialect: process.env.DB_DIALECT,
  },
};
