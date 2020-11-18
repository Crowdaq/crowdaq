var Busboy = require('busboy');
const {Validator} = require('jsonschema');
const express = require('express');
const _ = require("lodash");
const fs = require('fs')
const path = require('path')
const os = require('os')

const CrowdaqException = require('./error');
const logger = require("../logger");

class FnApiServer{
   
    constructor(app, option={}){
        const {
            doValidateInput, 
            doValidateOutput,
            strictMode,
            showDocument,
            path,
            version
        } = option;
        app.use(express.json());
        
        this.version = version;
        this.app = app;
        this.path = path;
        this.resolverMap = {}
        this.doValidateInput = doValidateInput === true;
        this.doValidateOutput = doValidateOutput === true;
        this.strictMode = strictMode === true;
        this.showDocument = showDocument === true;
    }

    start(port=4000){
        
        const finalPath = this.path || "/api";
        const version = this.version;
        
        this.app.get("/status", function(req, res){
            res.send(`Version [${version}] is running.`)
        });

        this.app.post(finalPath, this.process.bind(this));
        if (this.showDocument){
            this.app.get(finalPath, this.api_summary.bind(this));
        }else{
            this.app.get(finalPath, function(req, res){
                res.send("API");
            });
        }
        
        this.app.listen({ port }, () =>
            logger.info(`🚀 Server ready at http://localhost:${port}${finalPath}`)
        );
    }

    api_summary(req, res){
        const ret = _.chain(this.resolverMap).map(fn => {
            const {
                name,
                description
            } = fn
            return {
                name, 
                description
            }
        }).sortBy(x => x.name).value()

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(ret, null, 4));
        return;
    }

    merge(other){
        this.resolverMap = {
            ...this.resolverMap,
            ...other.resolverMap,
        }
    }

    addResolver(resolver){
        const {
            name,
            handle,
            input,
            output
        } = resolver;
        this.resolverMap[name] = resolver;
    }

    addResolvers(resolvers){
        for (let resolver of resolvers){
            this.addResolver(resolver);
        }
    }

    async execute(fn, args, req, res){
        const resolver = await this.resolverMap[fn];
        if (resolver === undefined){
            throw new CrowdaqException(`Unknown API function ${fn}`);
        }else{
            const {
                name,
                handle,
                input,
                output
            } = resolver;

            if (this.doValidateInput){
                const {
                    inputSchema,
                    inputValidator
                } = input;

                if(inputSchema){
                    const validator = new Validator()
                    validator.addSchema(inputSchema, "inputSchema");
                    const validationResult = validator.validate(args, "inputSchema");
                    if (!validationResult.valid){
                        if (this.strictMode){
                            throw new CrowdaqException("User provided input violates api schema.", 400)
                        }
                    }
                }

                if(inputValidator){
                    const validationResult = inputValidator.validate(args, "inputSchema");
                    if (!validationResult.valid){
                        if (this.strictMode){
                            throw new CrowdaqException("User provided input violates api schema.", 500)
                        }
                    }
                }
            }
            try{
                const output = await handle(args, req, res);
                if (this.doValidateOutput){
                    const {
                        outputSchema,
                        outputValidator
                    } = output;
                    
                    if(outputSchema){
                        const validator = new Validator()
                        validator.addSchema(outputSchema, "outputSchema");
                        const validationResult = validator.validate(args, "outputSchema");
                        if (!validationResult.valid){
                            if (this.strictMode){
                                throw new CrowdaqException("Output violates api schema.", 400)
                            }
                        }
                    }
                    if(outputValidator){
                        const validationResult = outputValidator.validate(args, "outputSchema");
                        if (!validationResult.valid){
                            if (this.strictMode){
                                throw new CrowdaqException("Output violates api schema.", 500)
                            }
                        }
                    }
                }
                return output;
            }catch(e){
                logger.error(e);
                if (e instanceof CrowdaqException){
                    throw e;
                }else{
                    logger.error(e.stack);
                    throw new CrowdaqException("Server Error", 500)
                }
            }
        }
    }


    async handleJsonRequest(json, req, res){
        const {
            fn,
            args
        } = json;
    
        logger.debug({
            fn,
            args
        });

        const startTime = new Date().getTime()
    
        try {
            const fn_result = await this.execute(fn, args, req, res);

            logger.info({
                fn,
                status: "success",
                time: (new Date().getTime() - startTime)
            })

            logger.debug(fn_result);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(fn_result));
            return;
        }catch(err) {
            logger.error(err);
            logger.info({
                fn,
                status: "error",
                time: (new Date().getTime() - startTime)
            })
            if(err instanceof CrowdaqException){
                res.setHeader('Content-Type', 'application/json');
                res.status(err.code)
                res.end(JSON.stringify({
                    message: err.message
                }));
                return;
            }else{
                logger.error(err)
                res.setHeader('Content-Type', 'application/json');
                res.status(500)
                res.end(JSON.stringify({
                    message: "Something unexpected happened."
                }));
                return;
            }
        }
    }

    async process(req, res){

        if (req.method !== "POST"){
            logger.error(`This only handle POST, but received ${req.method}`)
            return;
        }

        logger.debug(req.headers);
        const requestContentType = req.headers['content-type'];
        logger.debug(req.headers);
        logger.debug(`Received request content type, `, requestContentType);
    
        if (requestContentType === 'application/json'){
            this.handleJsonRequest(req.body, req, res);
        }else if (requestContentType.startsWith('multipart/form-data')){
            const busboy = new Busboy({ headers: req.headers });
            req.files = [];

            const filePromises = []

            busboy.on('file', function(fieldname, fileStream, filename, encoding, mimetype) {
              const saveTo = path.join('/tmp', `${path.basename(fieldname)}-${filename}`,);
              fileStream.pipe(fs.createWriteStream(saveTo));

              const fileEntry = {
                saveTo,
                fieldname, 
                filename, 
                encoding, 
                mimetype
            }

              const p = new Promise((resolutionFunc,rejectionFunc) => {
                fileStream.on('end', () => {
                    logger.debug({
                        fileEntry
                    }, "is finished")
                    resolutionFunc(true);
                })
                fileStream.on('error', () => {
                    logger.error(`Upload file ${filename} failed.`)
                    rejectionFunc(new Error(`Upload file ${filename} failed`));
                })
              })

              filePromises.push(p);

              req.files.push(fileEntry)
              logger.debug(req.files);
            });

            busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
                logger.debug({fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype})
                if (fieldname === 'fn'){
                    req.__fnreq__ = JSON.parse(val)
                }else{
                    logger.error("Unknown multipart field")
                }
            });
          
            busboy.on('finish', () => {
                Promise.all(filePromises).then(v => {
                    logger.debug('Upload done');
                    this.handleJsonRequest(req.__fnreq__, req, res);
                }).catch(err => {
                    logger.error("Multipart request failed.")
                    res.setHeader('Content-Type', 'application/json');
                    res.status(500)
                    res.end(JSON.stringify({
                        message: "Something unexpected happened."
                    }));
                })
                
            });
            return req.pipe(busboy);
        
        }else{
            res.setHeader('Content-Type', 'application/json');
            res.status(400)
            res.end(JSON.stringify({
                message: `invalid request content type: ${requestContentType}`
            }));
            return;
        }
    }
}




module.exports = FnApiServer