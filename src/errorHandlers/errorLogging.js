const winston = require('winston');

const logger = winston.createLogger({
    level: 'error', 
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log' }),
        new winston.transports.Console() 
    ]
});

function logError(error) {
    logger.error(error.stack || error);
}

module.exports = { logError };
