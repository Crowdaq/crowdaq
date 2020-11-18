const {
    knex,
    get_new_id,
    create_spread
} = require('../db/knex');

const {
    LIST_FROM_DB, GET_FROM_DB, DELETE_FROM_DB, ITEM_EXIST, UPDATE_FROM_DB
} = require('../db/common');

const CrowdaqException = require("../api/error")

const sha256 = require('crypto-js/sha256');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require("../logger");

function hashPassword(password, salt=undefined){
    if (salt === undefined){
        salt = crypto.randomBytes(16).toString('base64')
    }
    const hashed_password = sha256(salt + password).toString();
    return {
        hashed_password,
        salt
    }
}

function installOn(apiServer, option={}){
    const {appSecret} = option

    if (!appSecret){
        throw new Error("You must supply an appSecret for the user app.")
    }

    apiServer.addResolver(
        {
            name: 'login',
            handle: async function(args, req, res){
                const {
                    username,
                    password
                } = args;
            
                logger.debug("Login request.");

                const user = await knex("Users")
                    .where({
                        username
                    }).first();
            
                if (user === undefined){
                    throw new CrowdaqException("Login failed", 401)
                }
            
                const {hashed_password} = hashPassword(password, user.salt);
                if (hashed_password === user.hashed_password){
            
                    let token = jwt.sign({
                        username
                    }, appSecret, {expiresIn: "1d"});
                    // res.cookie("auth_token", token);

                    logger.debug("Login success.");

                    return {
                        token: token,
                        success: true
                    }
                }else{
                    logger.debug("Login failed.");
                    throw new CrowdaqException("Login failed" ,401);
                }
            }
    })
            
    apiServer.addResolver({
        name: 'logout', 
        handle: async function(args, req, res){
            res.cookie("auth_token", '');
            return {
                success: false
            };
        }
    })
    
    apiServer.addResolver({
        name: 'register', 
        handle: async function(args, req, res){
            const {
                username,
                password
            } = args;
        
            logger.debug(args);
        
            const _id = uuidv4();
            const {salt, hashed_password} = hashPassword(password);
        
            const user_exist = await ITEM_EXIST(
                'Users',
                {username}
            )
        
            if (user_exist){
                logger.debug(`User ${username} exists.`)
                throw new CrowdaqException(`User ${username} exists.`);
            }else{
                let ret = await knex("Users").insert({
                    username, salt, hashed_password, ...create_spread()      
                }).returning("username");
                logger.debug(ret);
        
                let token = jwt.sign({
                    username,
                }, appSecret, {expiresIn: "1d"});
            
                return {
                    username, token
                }
            }   
        }
    })

    apiServer.app.use(function (req, res, next) {
        logger.debug("Running Auth Middleware");

        req.ensureUser = function(username){
            if (username ===  null || username ===  undefined){
                throw new CrowdaqException("Provided username is empty.", 401);
            }
        
            if (this.__user__ && this.__user__.username && this.__user__.username === username){
                return;
            }else{
                throw new CrowdaqException("Premission Denied.", 401);
            }
        };

        logger.debug(req.ensureUser);

        // Token based auth.
        // We parse header:
        // "Authorization": `Bearer ${token}"`
        const bearer = req.headers['authorization'];
        logger.debug("bearer = {}", bearer);
        if(bearer !== undefined){
            const token = bearer.substring(7);
    
            logger.debug(
                {
                    ...req.body,
                    token
                }
            );
            if (token !== undefined && token !== ''){
                try{
                    const verified = jwt.verify(token, appSecret)
                    req.__user__ = {
                        username: verified.username
                    }
                    logger.debug(req.__user__)
                }catch(e){
                    logger.debug("Token validation failed with reason" ,e);
                }
            }
        }
        logger.debug("Parsing Auth Token done.");
        next()
    });
}

module.exports={
    installOn
};

