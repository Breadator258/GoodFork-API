import mariadb from "mariadb";
import config from "../config/config.js";
import ModelError from "../global/ModelError.js";
import Stock from "../api/models/Stock.js";
import StockStatistics from "../api/models/StockStatistics.js";

const pool = mariadb.createPool({
	host: config.db.host,
	port: config.db.port,
	database: config.db.dbname,
	user: config.db.user,
	password: config.db.password,
	connectionLimit: config.db.connectionLimit
});

async function createDailyStockStat() {
	console.log("Starting saving process...");
	const db = await pool.getConnection();
	const stock = await Stock.getAll(db);
	let errorCount = 0;

	for (const item of stock) {
		console.log(`Processing "${item.name}" (ID: ${item.stock_id})...`);
		const result = await StockStatistics.add(db, item.stock_id, item.units);

		if (result instanceof ModelError) {
			errorCount++;
			console.warn(`Error while adding "${item.name}" (ID: ${item.stock_id}).\n${result.message()}`);
		}
	}

	console.log(`Saving process finished with ${errorCount} error${errorCount > 1 ? "s" : ""}`);
	process.exit();
}

createDailyStockStat()
	.catch(console.error);