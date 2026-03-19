require("dotenv").config();
const express = require("express");
const app = express();
const pinoHttp = require("pino-http");
const logger = require("./log/logger");

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
