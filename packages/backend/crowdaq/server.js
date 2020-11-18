/* global process:writable */

const {getApp, logger} = require("./index");

const crowdaqConfigs = {
    production: {
        corsOrigin: /crowdaq\.com$/,
        appSecret: process.env.APP_SECRET,
        path: "/apiV2",
        showDocument: false,
    },
    development: {
        corsOrigin: "http://localhost:8080",
        appSecret: "random-dev-string",
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

if (process.env.CROWDAQ_CREATE_USER === 'true') {
    if (process.env.CROWDAQ_CREATE_USER_NAME && process.env.CROWDAQ_CREATE_USER_PASSWORD){
        apiServer.execute(
            "register",
            {
                username: process.env.CROWDAQ_CREATE_USER_NAME,
                password: process.env.CROWDAQ_CREATE_USER_PASSWORD
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

}


const port = process.env.NODE_ENV !== 'production' ? 4000 : 80;

apiServer.start(port);