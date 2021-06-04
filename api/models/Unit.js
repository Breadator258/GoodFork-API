/**
 * @module models/Unit
 * @description Units are measurement units used for some values like quantities.
 */

/**
 * A Unit
 * @typedef {Object} Unit
 * @property {Number} unit_id - ID of the unit
 * @property {string} name - Unit name
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- READ ---------------------------------- */
/**
 * @function getAll
 * @async
 * @description Get all units
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<Unit>>} A list of units
 *
 * @example
 * 	Unit.getAll(db)
 */
const getAll = async db => {
	return db.query("SELECT unit_id, name FROM units ORDER BY unit_id");
};

/*****************************************************
 * Export
 *****************************************************/

const Unit = { getAll };
export default Unit;