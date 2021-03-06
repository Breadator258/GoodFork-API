/** @module models/SalesStatistics */
import Checkers from "../../global/Checkers.js";
import ModelError from "../../global/ModelError.js";

/**
 * A sale statistic
 * @typedef {Object} SaleStatistic
 * @property {Number} stat_id - ID of the statistic
 * @property {Date} day - Which day is corresponding to that statistic
 * @property {Number} benefits - How much this day bring in
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
/**
 * @ignore
 * @async
 * @function addTodayStat
 * @description Add a row for today in the table
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Number>} The id of the newly inserted row
 *
 * @example
 * 	SalesStatistics.addTodayStat(db)
 */
const addTodayStat = async (db) => {
	const stat = await db.query("INSERT INTO sales_statistics VALUES ()");
	return stat.insertId;
};

/**
 * @async
 * @function addBenefits
 * @description Add benefits the the current day statistics
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number} benefits - How much you add to the current benefits
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	SalesStatistics.addBenefits(db, 13.90)
 */
const addBenefits = async (db, benefits) => {
	if (!Checkers.isNumber(benefits)) {
		return new ModelError(400, "Vous devez fournir un bénéfice valide.");
	}

	const todayStat = await getCurrDayId(db);

	return db.query(`
		UPDATE sales_statistics
		SET benefits = benefits + ?
		WHERE stat_id = ?
	`, [ benefits, todayStat ]);
};

/* ---- READ ------------------------------------ */
/**
 * @async
 * @function getToday
 * @description Get the statistic for this day
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<SaleStatistic|ModelError>} The today stat or a ModelError
 *
 * @example
 * 	SalesStatistics.getToday(db)
 */
const getToday = async (db) => {
	const stat = await db.query(`
		SELECT
			stat_id,
			day,
			benefits
		FROM sales_statistics
		WHERE day = CURDATE()
		LIMIT 1
	`);

	return stat[0] ? stat[0] : new ModelError(404, "Aucune statistiques de ventes n'est disponible pour aujourd'hui.");
};

/**
 * @async
 * @function getWeek
 * @description Get the statistic for this week
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<SaleStatistic>>} A list of SaleStatistic
 *
 * @example
 * 	SalesStatistics.getWeek(db)
 */
const getWeek = async (db) => {
	return await db.query(`
		SELECT
			stat_id,
			day,
			benefits
		FROM sales_statistics
		WHERE
			day >= DATE(NOW()) + INTERVAL -6 DAY
			AND day < NOW() + INTERVAL 0 DAY
	`);
};

/**
 * @ignore
 * @async
 * @function getCurrDayId
 * @description Get the stat ID for today
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Number>} Today stat ID
 *
 * @example
 * 	SalesStatistics.getCurrDayId(db)
 */
const getCurrDayId = async (db) => {
	const stat = await db.query(`
		SELECT
			stat_id,
			day,
			benefits
		FROM sales_statistics
		WHERE day = CURDATE()
		LIMIT 1
	`);

	return stat[0] ? stat[0].stat_id : await addTodayStat(db);
};

/*****************************************************
 * Export
 *****************************************************/

const SalesStatistics = { addBenefits, getToday, getWeek };
export default SalesStatistics;