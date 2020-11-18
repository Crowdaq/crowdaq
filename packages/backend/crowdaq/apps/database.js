const logger = require("../logger");

function installOn(apiServer, option={}){
    const {knex} = option;
    if (knex === undefined){
        logger.error("Knex object must be provided.");
    }
    apiServer.app.use(function (req, res, next){
        req.database = knex;
        next();
    })
}