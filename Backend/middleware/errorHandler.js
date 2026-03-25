/**
 * Error Handling Middleware
 * Catches and formats all errors into consistent response envelopes
 * Per Backend_Handoff.md: Stable error envelope format
 */

const { sendError } = require('../utils/responses');
const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Must be registered last in middleware chain
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Default error values
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details = [];

  // Handle specific error types
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid or malformed authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.keys(err.errors).map((field) => ({
      field,
      message: err.errors[field].message,
    }));
  } else if (err.name === 'MongooseError') {
    statusCode = 400;
    code = 'DATABASE_ERROR';
    message = 'Database operation failed';
  } else if (err.statusCode) {
    // Custom error with status code
    statusCode = err.statusCode;
    code = err.code || 'ERROR';
    message = err.message;
    if (err.details) {
      details = err.details;
    }
  } else if (err.message === 'Access token expired' || err.message === 'Refresh token expired') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Your session has expired. Please log in again.';
  } else if (err.message && err.message.includes('Invalid')) {
    statusCode = 400;
    code = 'INVALID_REQUEST';
    message = err.message;
  }

  // Send error response
  return sendError(res, message, code, details, statusCode);
};

/**
 * 404 Not Found Middleware
 * Called when no route matches
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'debug';

    logger[logLevel](
      `${req.method} ${req.originalUrl}`,
      {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
      }
    );
  });

  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  requestLogger,
};
