import "../config/env.js";
import knex from "knex";
import logger from "../log/logger.js";

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "backend-api",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
    afterCreate: (conn, done) => {
      logger.debug("New DB connection established");
      done(null, conn);
    },
  },
});

export default db;
