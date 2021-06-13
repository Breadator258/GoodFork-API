/** @module models/StockStatistics */
import Checkers from "../../global/Checkers.js";
import ModelError from "../../global/ModelError.js";

/**
 * A stock statistic
 * @typedef {Object} StockStatistic
 * @property {Number} stat_id - ID of the statistic
 * @property {Number} stock_id - ID of the corresponding stock item
 * @property {Date} day - Which day is corresponding to that statistic
 * @property {Number} units - How much of this item was present
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
/**
 * @async
 * @function add
 * @description Add a row for today in the table
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number} stock_id - ID of the corresponding stock item
 * @param {Number} units - How much of this item was present
 * @returns {Promise<Number|ModelError>} The id of the newly inserted row or a ModelError
 *
 * @example
 * 	StockStatistics.add(db, 12, 2436)
 */
const add = async (db, stock_id, units) => {
	if (!Checkers.isNumber(units)) {
		return new ModelError(400, "Vous devez fournir une quantité valide.");
	}

	const todayStat = await getTodayByStockId(db, stock_id);

	if (todayStat instanceof ModelError) {
		const stat = await db.query("INSERT INTO stock_statistics(stock_id, units) VALUES (?, ?)", [stock_id, units]);
		return stat.insertId;
	} else {
		await db.query("UPDATE stock_statistics SET units = ? WHERE stock_id = ?", [units, stock_id]);
		return stock_id;
	}
};

/* ---- READ ------------------------------------ */
/**
 * @async
 * @function getToday
 * @description Get the statistic for this day
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<StockStatistic>>} A list of stats
 *
 * @example
 * 	StockStatistics.getToday(db)
 */
const getToday = async (db) => {
	return await db.query(`
		SELECT
			ss.stat_id,
			ss.stock_id,
			stocks.name AS "name",
			ss.day,
			ss.units
		FROM stock_statistics ss
		INNER JOIN stocks ON ss.stock_id = stocks.stock_id
		WHERE day = CURDATE()
	`);
};

/**
 * @async
 * @function getTodayByStockId
 * @description Get the statistic for this day with a specific stock ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number} stock_id - ID of the corresponding stock item
 * @returns {Promise<StockStatistic|ModelError>} A list of stats
 *
 * @example
 * 	StockStatistics.getTodayByStockId(db, 7)
 */
const getTodayByStockId = async (db, stock_id) => {
	const stat = await db.query(`
		SELECT
			ss.stat_id,
			ss.stock_id,
			stocks.name AS "name",
			ss.day,
			ss.units
		FROM stock_statistics ss
		INNER JOIN stocks ON ss.stock_id = stocks.stock_id
		WHERE ss.day = CURDATE() AND ss.stock_id = ?
		LIMIT 1
	`, [stock_id]);

	return stat[0] ? stat[0] : new ModelError(`Aucune statistique n'a été trouvée aujourd'hui pour l'élément "${stock_id}"`);
};

/**
 * @async
 * @function getWeek
 * @description Get the statistic for this week
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<StockStatistic>>} A list of stats
 *
 * @example
 * 	SalesStatistics.getWeek(db)
 */
const getWeek = async (db) => {
	return await db.query(`
		SELECT
			ss.stat_id,
			ss.stock_id,
			stocks.name AS "name",
			ss.day,
			ss.units
		FROM stock_statistics ss
		INNER JOIN stocks ON ss.stock_id = stocks.stock_id
		WHERE
			ss.day >= DATE(NOW()) + INTERVAL -6 DAY
			AND ss.day < NOW() + INTERVAL 0 DAY
	`);
};

/*****************************************************
 * Export
 *****************************************************/

const StockStatistics = { add, getToday, getTodayByStockId, getWeek };
export default StockStatistics;