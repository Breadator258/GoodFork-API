import express from "express";
import http from "http";
import https from "https";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";
import config from "./config/config.js";
import routes from "./api/index.js";

/**
 * @async
 * @function startServer
 * @description Set up http and https server on port 8080 and 8433.
 *
 * @returns {Promise<void>}
 */
async function startServer() {
	// Set up HTTPS certificates
	const key  = fs.readFileSync("./certs/cert.key", "utf8");
	const cert  = fs.readFileSync("./certs/cert.pem", "utf8");
	const opts = { key: key, cert: cert, passphrase: config.app.https.passphrase };

	const app = express();
	const server = http.createServer(app);
	const secureServer = https.createServer(opts, app);
	const port = config.app.port || 3000;
	const securePort = config.app.https.port || 3443;

	// Route for checking server status
	app.get("/status", (request, response) => {
		response.status(200).end();
	});

	// Enable CORS middleware
	// noinspection JSCheckFunctionSignatures
	app.use(cors());

	// Serve static files
	app.use("/images", express.static("./uploads"));

	// Transform raw into JSON
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	// Add API routes
	app.use(config.api.prefix, routes());

	// Handle 404
	app.use((request, response, next) => {
		response.status(404).end();
		next();
	});

	// Start listening
	server
		.listen(port, () => console.log(getStartedMessage("http", port)))
		.on("error", err => {
			console.error(err);
			process.exit(1);
		});

	secureServer
		.listen(securePort, () => console.log(getStartedMessage("https", securePort)))
		.on("error", err => {
			console.error(err);
			process.exit(1);
		});
}

/**
 * @function getStartedMessage
 * @description Get a formatted message to show in the console when a server is started.
 *
 * @param {string} protocol - The protocol used by the server (http, https)
 * @param {string|int} port - The port number used by the server
 * @returns {string} The complete message
 *
 * @example
 * 	getStartedMessage("http", 80)
 */
function getStartedMessage(protocol, port) {
	return "############# The Good Fork API ##############\n" +
    `Server started. Listening on port ${port} (${protocol}).\n` +
    "##############################################";
}

startServer().catch(console.error);