import mariadb from "mariadb";
import config from "../config/config.js";
import ModelError from "../global/ModelError.js";
import Stock from "../api/models/Stock.js";
import StockStatistics from "../api/models/StockStatistics.js";
import Menu from "../api/models/Menu.js";
import MenusStatistics from "../api/models/MenusStatistics.js";

const pool = mariadb.createPool({
	host: config.db.host,
	port: config.db.port,
	database: config.db.dbname,
	user: config.db.user,
	password: config.db.password,
	connectionLimit: config.db.connectionLimit
});

async function runTasks() {
	const db = await pool.getConnection();

	await createDailyStockStat(db).catch(handleError);
	await createDailyMenusStat(db).catch(handleError);

	process.exit();
}

async function createDailyStockStat(db) {
	console.log("Starting stock saving process...");
	const stock = await Stock.getAll(db);
	let errorCount = 0;

	console.log(`Fetched "${stock.length}" stock items`);

	for (const item of stock) {
		console.log(`Processing "${item.name}" (ID: ${item.stock_id})...`);
		const result = await StockStatistics.add(db, item.stock_id, item.units);

		if (result instanceof ModelError) {
			errorCount++;
			console.warn(`Error while adding "${item.name}" (ID: ${item.stock_id}).\n${result.message()}`);
		}
	}

	console.log(`Saving process of stock finished with ${errorCount} error${errorCount > 1 ? "s" : ""}`);
}

async function createDailyMenusStat(db) {
	console.log("Starting menus saving process...");
	const menus = await Menu.getAll(db);
	let errorCount = 0;

	console.log(`Fetched "${menus.length}" menus`);

	for (const menu of menus) {
		console.log(`Processing "${menu.name}" (ID: ${menu.menu_id})...`);
		const result = await MenusStatistics.add(db, menu.menu_id);

		if (result instanceof ModelError) {
			errorCount++;
			console.warn(`Error while adding "${menu.name}" (ID: ${menu.menu_id}).\n${result.message()}`);
		}
	}

	console.log(`Saving process of menus finished with ${errorCount} error${errorCount > 1 ? "s" : ""}`);
}

function handleError(err) {
	console.log(err);
	process.exit(1);
}

runTasks().catch(handleError);