const winston = require('winston');

const log_level = process.env.NODE_ENV === 'production' ? "info" : 'debug'

console.log(`LOG-LEVEL=${log_level}`)

const myFormat = winston.format.printf(info => {
  return `${info.timestamp} ${info.level}: ${JSON.stringify(info.message, null, 2)}`;
});


const console_transport = process.env.NODE_ENV === 'production' ?
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    level: log_level
  }) : 
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.prettyPrint(),
      winston.format.colorize(),
      myFormat
    ),
    level: log_level
  });
 
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    console_transport
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
});

logger.debug("Debug mode is on.")

module.exports = logger;
