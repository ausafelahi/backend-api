import { AppError } from "../utils/AppError.js";

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError && err.isOperational) {
    req.log.warn({ err, code: err.code }, err.message);
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  req.log.error({ err }, "Unhandled error");

  res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
  });
}
