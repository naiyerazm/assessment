const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log error details
  logger.error('Unhandled Error', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Prisma specific errors (optional but useful)
  if (err.code === 'P2002') {
    statusCode = 400;
    message = 'Duplicate field value';
  }

  // JWT errors (optional)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Final response
  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;