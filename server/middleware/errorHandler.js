import mongoose from 'mongoose';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

// Runs when no route matched.
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Central error handler: EVERY error ends up here and becomes a JSON response
// with the same shape: { success: false, message, errors? }.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = err.errors;

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = errors[0]?.message || 'Validation failed';
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for "${err.path}"`;
    errors = undefined;
  } else if (err.code === 11000) {
    // Duplicate key from a unique index
    statusCode = 409;
    const keys = Object.keys(err.keyPattern || {});
    if (keys.includes('email')) message = 'An account with this email already exists';
    else if (keys.includes('student') && keys.includes('internship'))
      message = 'You have already applied to this internship';
    else message = 'Duplicate value';
    errors = undefined;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token. Please log in again.';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large';
  }

  if (statusCode >= 500) {
    console.error('Unhandled error:', err);
    // Never leak internal details in production.
    if (env.isProduction) message = 'Something went wrong on the server';
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  if (!env.isProduction && statusCode >= 500) body.stack = err.stack;

  res.status(statusCode).json(body);
};
