// Custom error carrying an HTTP status code. Thrown in controllers/middleware
// and converted to a JSON response by the central error handler (Part 2).
class ApiError extends Error {
  constructor(statusCode, message, errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // expected error, safe to show message to client
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
