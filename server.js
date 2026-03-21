import "./config/env.js";
import express from "express";
import pinoHttp from "pino-http";
import logger from "./log/logger.js";

const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());

app.get("/", (req, res) => {
  req.log.info("Received a request to the root endpoint");
  res.send("Hello World!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
