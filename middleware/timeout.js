export function timeout(ms = 5000) {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      req.log.warn(
        { url: req.originalUrl, method: req.method },
        "Request timeout",
      );
      res.status(503).json({
        success: false,
        code: "REQUEST_TIMEOUT",
        message: "Request took too long to process",
      });
    }, ms);

    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));
    next();
  };
}
