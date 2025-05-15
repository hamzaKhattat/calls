// src/utils/logger.js

/**
 * Logger utility for application-wide logging
 * Provides consistent logging format and supports multiple log levels
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Get log level from environment or use default
const logLevel = process.env.LOG_LEVEL || 'info';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`;
  })
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`;
  })
);

// Create logger
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'call-generator' },
  transports: [
    // Write logs to console
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write error logs to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // Don't exit on handled exceptions
  exitOnError: false
});

/**
 * Log message with call stack information for debugging
 * @param {string} level - Log level
 * @param {string} message - Message to log
 */
function logWithCallStack(level, message) {
  const stackInfo = new Error().stack
    .split('\n')
    .slice(3, 4)[0]
    .trim()
    .replace(/^at /, '');
  
  logger.log(level, `${message} (${stackInfo})`);
}

// Extended logger with call stack information for debugging
const extendedLogger = {
  error: (message) => logger.error(message),
  warn: (message) => logger.warn(message),
  info: (message) => logger.info(message),
  http: (message) => logger.http(message),
  verbose: (message) => logger.verbose(message),
  debug: (message) => logWithCallStack('debug', message),
  silly: (message) => logWithCallStack('silly', message),
  
  // Log message with call stack regardless of level (for debugging)
  trace: (message) => {
    const stack = new Error().stack
      .split('\n')
      .slice(2)
      .map(line => line.trim())
      .join('\n');
    
    logger.debug(`${message}\nCall Stack:\n${stack}`);
  },
  
  // Stream for Morgan HTTP request logging
  stream: {
    write: (message) => {
      logger.http(message.trim());
    }
  },
  
  // Create child logger with additional metadata
  child: (metadata) => {
    return winston.createLogger({
      ...logger.child(metadata)
    });
  }
};

// Export the extended logger
module.exports = extendedLogger;