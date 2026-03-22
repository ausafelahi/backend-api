export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const Errors = {
  notFound: (message = "Resource not found") =>
    new AppError(message, 404, "NOT_FOUND"),
  badRequest: (message = "Bad request") =>
    new AppError(message, 400, "BAD_REQUEST"),
  unauthorized: (message = "Unauthorized") =>
    new AppError(message, 401, "UNAUTHORIZED"),
  forbidden: (message = "Forbidden") => new AppError(message, 403, "FORBIDDEN"),
  internalServerError: (message = "Internal server error") =>
    new AppError(message, 500, "INTERNAL_SERVER_ERROR"),
  conflict: (message = "Conflict") => new AppError(message, 409, "CONFLICT"),
};
