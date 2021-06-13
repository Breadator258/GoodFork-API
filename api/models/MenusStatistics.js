/** @module models/MenusStatistics */
import Checkers from "../../global/Checkers.js";
import ModelError from "../../global/ModelError.js";

/**
 * A menus statistic
 * @typedef {Object} MenuStatistic
 * @property {Number} stat_id - ID of the statistic
 * @property {Number} menu_id - ID of the corresponding menu
 * @property {Date} day - Which day is corresponding to that statistic
 * @property {Number} count - How much of this menu has been ordered
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
 * @param {Number} menu_id - ID of the corresponding menu
 * @param {Number} count - How much of this menu has been ordered
 * @returns {Promise<Number|ModelError>} The id of the newly inserted row or a ModelError
 *
 * @example
 * 	MenusStatistics.add(db, 12)
 */
const add = async (db, menu_id, count = 0) => {
	if (!Checkers.isNumber(count)) {
		return new ModelError(400, "Vous devez fournir une quantité valide.");
	}

	const todayStat = await getTodayByMenuId(db, menu_id);

	if (todayStat instanceof ModelError) {
		const stat = await db.query("INSERT INTO menus_statistics(menu_id, count) VALUES (?, ?)", [menu_id, count ? count : 0]);
		return stat.insertId;
	} else {
		await db.query("UPDATE menus_statistics SET count = count + ? WHERE menu_id = ?", [count ? count : 0, menu_id]);
		return menu_id;
	}
};

/* ---- READ ------------------------------------ */
/**
 * @async
 * @function getToday
 * @description Get the statistic for this day
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<MenuStatistic>>} A list of stats
 *
 * @example
 * 	MenusStatistics.getToday(db)
 */
const getToday = async (db) => {
	return await db.query(`
		SELECT
			ms.stat_id,
			ms.menu_id,
			menus.name AS "name",
			ms.day,
			ms.count
		FROM menus_statistics ms
		INNER JOIN menus ON ms.menu_id = menus.menu_id
		WHERE day = CURDATE()
	`);
};

/**
 * @async
 * @function getTodayByMenuId
 * @description Get the statistic for this day with a specific menu ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number} menu_id - ID of the corresponding menu
 * @returns {Promise<MenuStatistic|ModelError>} A list of stats
 *
 * @example
 * 	MenusStatistics.getTodayByMenuId(db, 7)
 */
const getTodayByMenuId = async (db, menu_id) => {
	const stat = await db.query(`
		SELECT
			ms.stat_id,
			ms.menu_id,
			menus.name AS "name",
			ms.day,
			ms.count
		FROM menus_statistics ms
		INNER JOIN menus ON ms.menu_id = menus.menu_id
		WHERE ms.day = CURDATE() AND ms.menu_id = ?
		LIMIT 1
	`, [menu_id]);

	return stat[0] ? stat[0] : new ModelError(`Aucune statistique n'a été trouvée aujourd'hui pour le menu "${menu_id}"`);
};

/**
 * @async
 * @function getWeek
 * @description Get the statistic for this week
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<MenuStatistic>>} A list of stats
 *
 * @example
 * 	MenusStatistics.getWeek(db)
 */
const getWeek = async (db) => {
	return await db.query(`
		SELECT
			ms.stat_id,
			ms.menu_id,
			menus.name AS "name",
			ms.day,
			ms.count
		FROM menus_statistics ms
		INNER JOIN menus ON ms.menu_id = menus.menu_id
		WHERE
			ms.day >= DATE(NOW()) + INTERVAL -6 DAY
			AND ms.day < NOW() + INTERVAL 0 DAY
	`);
};

/*****************************************************
 * Export
 *****************************************************/

const MenusStatistics = { add, getToday, getTodayByMenuId, getWeek };
export default MenusStatistics;