require("dotenv").config();
const cors = require("cors");
const express = require("express");
const DB = require("./database/connection");
const {authMiddleware} = require("./middlewares/authMiddleware");
const fs = require("fs");
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const YAML = require('yamljs');
const {mergedSwaggerDocument} = require("./swagger/swaggerConfigurations");
const ora = require("ora");
const {rateLimiterMiddleware} = require("./middlewares/rateLimiterMiddleware");

const Reset = '\x1b[0m'; // Reset to default color
const FgRed = '\x1b[31m'; // Red text
const FgGreen = '\x1b[32m'; // Green text
const FgYellow = '\x1b[33m'; // Yellow text

const userPort = process.env.USER_PORT || 8080;
const adminPort = process.env.ADMIN_PORT || 8000;

const spinner = ora('Initializing server... ').start();

const userApp = express();
const adminApp = express();

const swaggerDirectory = path.join(__dirname, 'swagger');
fs.readdirSync(swaggerDirectory).forEach((file) => {
    if (file.endsWith('.yaml')) {
        const swaggerDocument = YAML.load(path.join(swaggerDirectory, file));
        Object.assign(mergedSwaggerDocument.paths, swaggerDocument.paths);
    }
});

userApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(mergedSwaggerDocument));

userApp.use(cors());
userApp.use(express.json({limit: "5mb"}));

userApp.use(rateLimiterMiddleware);
userApp.use(authMiddleware);

require("./admin/adminPanel.js")(adminApp);
fs.readdirSync('./routes/').forEach(function (file) {
    require('./routes/' + file)(userApp);
});

userApp.use((req, res, next) => {
    return res.status(404).json({error: `${req.url} not found in this server`});
});

DB.connectToDB().then(() => {
    adminApp.listen(adminPort, () => console.log(FgYellow + "Admin dashboard listening on port " + FgRed + adminPort + Reset));
    userApp.listen(userPort, () => console.log(FgGreen + "Server Up on port " + FgRed + userPort + Reset));
}).catch(() => {
    console.log(FgRed + "Could not connect to database" + Reset);
}).finally(() => {
    spinner.stop();
});

module.exports = userApp;

