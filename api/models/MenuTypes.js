/** @module models/MenuTypes */
import ModelError from "../../global/ModelError.js";

/**
 * A MenuType
 * @typedef {Object} MenuType
 * @property {Number} type_id - ID of the menu type
 * @property {string} name - Type name
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- READ ------------------------------------ */
/**
 * @function getByName
 * @async
 * @description Get a menu type by its name
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} name - Name of the menu type
 * @returns {Promise<MenuType|ModelError>} A menu type or a ModelError
 *
 * @example
 * 	MenuTypes.getByName(db, "entrée")
 */
const getByName = async (db, name) => {
	const type = await db.query(`
		SELECT type_id, name
		FROM menu_types
		WHERE name = ?
	`, [name]);

	return type[0] ? type[0] : new ModelError(404, "No type found with this name.");
};

/**
 * @function getAll
 * @async
 * @description Get all menu types
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<MenuType>|ModelError>} A list of menu type or a ModelError
 *
 * @example
 * 	MenuTypes.getAll(db)
 */
const getAll = async db => {
	return db.query(`
		SELECT type_id, name
		FROM menu_types
		ORDER BY type_id
	`);
};

/*****************************************************
 * Export
 *****************************************************/

const MenuTypes = { getByName, getAll };
export default MenuTypes;