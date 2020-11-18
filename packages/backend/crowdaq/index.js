/* global process:writable */
const {version} = require('./version.json')
const express = require('express');
const logger = require('./logger')
const ApiServer = require("./api")
const cors = require('cors')
const userApp = require("./apps/users");
const crowdaqApp = require("./apps/crowdaq");

function getApp(crowdaqConfig){
    const app = express();

    logger.info(`Running version ${version}`)

    logger.info(`Using CORS for ${crowdaqConfig.corsOrigin}...`);
    const corsOptions = {
        origin: crowdaqConfig.corsOrigin,
        optionsSuccessStatus: 204,
        credentials: true // some legacy browsers (IE11, constious SmartTVs) choke on 204
    }
    app.options('*', cors(corsOptions)) // include before other routes
    app.use(cors(corsOptions));

    const apiServer = new ApiServer(app, {
        path: crowdaqConfig.path,
        showDocument: crowdaqConfig.showDocument,
        version
    });

    userApp.installOn(apiServer, crowdaqConfig);
    crowdaqApp.installOn(apiServer);
    return apiServer
}


module.exports = {
    getApp,
    logger
}