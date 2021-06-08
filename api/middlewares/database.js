/** @module middlewares */
import mariadb from "mariadb";
import config from "../../config/config.js";

const pool = mariadb.createPool({
	host: config.db.host,
	port: config.db.port,
	database: config.db.dbname,
	user: config.db.user,
	password: config.db.password,
	connectionLimit: config.db.connectionLimit
});

/**
 * @async
 * @function database
 * @description Get a connection to the database using MariaDB Connector
 *
 * @param {Request} request - Express Request
 * @param {Response} response -  Express Response
 * @param {function} next - Express next()
 * @returns {Promise<void>}
 *
 * @example
 * 	route.post("/", middlewares.database, (request, response) => {
 *		...
 * 	});
 */
const database = async (request, response, next) => {
	request.database = new Promise((resolve, reject) => {
		pool.getConnection()
			.then(conn => resolve(conn))
			.catch(err => reject(err));
	});

	next();
};

export default database;