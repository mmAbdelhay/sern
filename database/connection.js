const Sequelize = require("sequelize");
const ora = require("ora");
const chalk = require("chalk");
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DB_DATABASE_DEV,
    process.env.DB_USERNAME_DEV,
    process.env.DB_PASSWORD_DEV,
    {
        host: process.env.DB_HOST_DEV,
        port: process.env.DB_PORT_DEV,
        dialect: process.env.DB_DIALECT,
    }
);

const connectToDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(chalk.greenBright('Connection has been established successfully.'))
        return true;
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        return false;
    }
};

module.exports = {connectToDB: connectToDB};
