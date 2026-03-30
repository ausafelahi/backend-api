import "./config/env.js";
import express from "express";
import pinoHttp from "pino-http";
import logger from "./log/logger.js";
import { timeout } from "./middleware/timeout.js";
import { errorHandler } from "./middleware/errorHandler.js";
import patientRoutes from "./routes/patient.js";
import doctorRoutes from "./routes/doctor.js";
import queueRoutes from "./routes/queue.js";

const app = express();

app.use(express.json());

app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} ${res.statusCode}`,
  }),
);

app.use(timeout(5000));

app.use("/patients", patientRoutes);
app.use("/doctors", doctorRoutes);
app.use("/queue", queueRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(
    { port: PORT, env: process.env.NODE_ENV },
    "MediQueue server started",
  );
});

const shutdown = (signal) => {
  logger.warn(
    { signal },
    "Shutdown signal received — closing server gracefully",
  );
  server.close(() => {
    logger.info("HTTP server closed");
    setTimeout(() => process.exit(0), 10_000).unref();
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception — shutting down");
  process.exit(1);
});

export default app;
