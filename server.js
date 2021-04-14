import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import config from "./config/config.js";
import routes from "./api/index.js";

async function startServer() {
  const app = express();
  const port = config.app.port || 3000;

  // Route for checking server status
  app.get("/status", (request, response) => {
    response.status(200).end();
  });

  // Enable CORS middleware
  // noinspection JSCheckFunctionSignatures
  app.use(cors());

  // Transform raw into JSON
  app.use(bodyParser.json());

  // Add API routes
  app.use(config.api.prefix, routes());

  // Handle 404
  app.use((request, response, next) => {
    response.status(404).end();
    next();
  });

  // Start listening
  app.listen(port, () => {
    console.log(`Server started and listening on port ${port}`);
  }).on("error", err => {
    console.error(err);
    process.exit(1);
  });
}

startServer().catch(console.error);