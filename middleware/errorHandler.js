import { AppError } from "../utils/AppError";

export function errorHandler(err, req, res) {
  if (err instanceof AppError && err.isOperational) {
    req.log.warn(`Operational error: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
    });
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }
}

req.log.error(`Unexpected error: ${err.message}`, {
  code: err.code,
  statusCode: err.statusCode,
  stack: err.stack,
});

res.status(500).json({
  success: false,
  code: "INTERNAL_SERVER_ERROR",
  message: "An unexpected error occurred. Please try again later.",
});
