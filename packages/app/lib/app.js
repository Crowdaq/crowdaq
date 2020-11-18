'use strict';

const {getApp, logger} = require("@crowdaq/backend")

/* global process:writable */

const {getApp, logger} = require("./index");

const crowdaqConfigs = {
    production: {
        corsOrigin: "http://localhost:8080",
        appSecert: process.env.APP_SECERT,
        path: "/apiV2",
        showDocument: false,
    },
    development: {
        corsOrigin: /crowdaq\.com$/,
        appSecert: "random-dev-string",
        path: "/apiV2",
        showDocument: true,
    }
}

const config = process.env.NODE_ENV === 'production' ?  crowdaqConfigs.production : crowdaqConfigs.development;
const apiServer = getApp(config);

if (process.env.NODE_ENV !== 'production'){
    apiServer.execute(
        "register", 
        {
            username: "test_user",
            password: "password"
        },
        null,
        null,
    ).then(resp => {
        logger.debug(resp);
    }).catch(err => {
        logger.debug("Create test user failed.");
        logger.debug(err)
    })
}


const port = process.env.NODE_ENV !== 'production' ? 4000 : 80;

apiServer.start(port);