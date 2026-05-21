/**
 * Global Error Handler Middleware
 * Standardizes all error responses across the API
 *
 * Usage: app.use(errorHandler) as last middleware
 */

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error response structure
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";
  let message = err.message || "An unexpected error occurred";
  let details = err.details || {};

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = "Request validation failed";
    details = { errors: err.errors };
  }

  if (err.name === "UnauthorizedError") {
    statusCode = 401;
    errorCode = "UNAUTHORIZED";
    message = "Unauthorized access";
  }

  if (err.name === "ForbiddenError") {
    statusCode = 403;
    errorCode = "FORBIDDEN";
    message = "Access forbidden";
  }

  if (err.name === "NotFoundError") {
    statusCode = 404;
    errorCode = "NOT_FOUND";
    message = "Resource not found";
  }

  // Handle database errors
  if (err.code === "23505") {
    // PostgreSQL unique constraint violation
    statusCode = 409;
    errorCode = "DUPLICATE_ENTRY";
    message = "Duplicate entry - this resource already exists";
    details = { constraint: err.constraint };
  }

  if (err.code === "23503") {
    // PostgreSQL foreign key violation
    statusCode = 400;
    errorCode = "INVALID_REFERENCE";
    message = "Invalid reference to related resource";
    details = { constraint: err.constraint };
  }

  // Standard error envelope
  const response = {
    success: false,
    error_code: errorCode,
    message,
    details,
    timestamp: new Date().toISOString(),
  };

  // Include request ID if available (for debugging)
  if (req.id) {
    response.request_id = req.id;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 * Should be placed before errorHandler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error_code: "NOT_FOUND",
    message: `Endpoint ${req.method} ${req.path} not found`,
    details: { method: req.method, path: req.path },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Custom Error class for throwing HTTP errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = "INTERNAL_ERROR", details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
