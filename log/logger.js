const pino = require("pino");

const isDev = process.env.NODE_ENV !== "production";

const logger = pino({
  level: isDev ? "info" : "debug",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

module.exports = logger;
