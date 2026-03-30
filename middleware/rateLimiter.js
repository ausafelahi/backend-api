import { rateLimit } from "express-rate-limit";
import logger from "../log/logger.js";

export function createRateLimiter({ windowMs = 60_000, max = 100 } = {}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
      logger.warn({ ip: req.ip }, "Rate limit exceeded");
      res.status(429).json({
        success: false,
        code: "RATE_LIMITED",
        message: "Too many requests, please slow down",
      });
    },

    skip: () => process.env.NODE_ENV === "test",
  });
}
