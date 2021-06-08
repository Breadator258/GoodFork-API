/**
 * @module models/Unit
 * @description Units are measurement units used for some values like quantities.
 * @deprecated The new measurement system must be used
 */

/**
 * A Unit
 * @typedef {Object} Unit
 * @deprecated
 * @property {Number} unit_id - ID of the unit
 * @property {string} name - Unit name
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- READ ---------------------------------- */
/**
 * @async
 * @function getAll
 * @description Get all units
 * @deprecated
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