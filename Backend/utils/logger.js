/**
 * Logger Configuration
 * Winston-based logging with console and file output
 * Per SRS 5.3 & Backend_Plan 1.2: Configure logging system
 */

const winston = require('winston');
const config = require('../config/environment');

// Custom log levels
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  colors: {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'gray',
  },
};

// Console format
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  })
);

// File format (JSON for parsing)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: config.logging.level,
  format: fileFormat,
  defaultMeta: {
    service: 'college-admin-backend',
    environment: config.app.env,
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

// Add colors to custom levels
winston.addColors(customLevels.colors);

/**
 * Log helper methods
 */
logger.success = (message, meta) => {
  logger.info(message, meta);
};

logger.fatal = (message, meta) => {
  logger.log('fatal', message, meta);
};

module.exports = logger;
