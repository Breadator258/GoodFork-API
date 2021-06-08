/**
 * @module models/MeasurementUnit
 * @description Measurement units are used for some values like quantities.
 */
import ModelError from "../../global/ModelError.js";

/**
 * A MeasurementUnit
 * @typedef {Object} MeasurementUnit
 * @property {Number} unit_id - ID of the unit
 * @property {string} name - Unit name
 * @property {Boolean|Number} used_in_stock - Is a valid measurement unit in the stock ?
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- READ ---------------------------------- */

/**
 * @function getById
 * @async
 * @description Get a measurement unit by its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} unit_id - ID of the unit
 * @returns {Promise<MeasurementUnit>} A measurement unit
 *
 * @example
 * 	MeasurementUnit.getById(db, 5)
 */
const getById = async (db, unit_id) => {
	const unit = await db.query("SELECT unit_id, name, used_in_stock FROM measurement_units WHERE unit_id = ?", [unit_id]);
	return unit[0] ? unit[0] : new ModelError(400, `Aucune unité de mesure n'a été trouvée avec l'ID "${unit_id}"`);
};

/**
 * @function getAll
 * @async
 * @description Get all measurement units
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<MeasurementUnit>>} A list of measurement units
 *
 * @example
 * 	MeasurementUnit.getAll(db)
 */
const getAll = async db => {
	return db.query("SELECT unit_id, name, used_in_stock FROM measurement_units ORDER BY unit_id");
};

/*****************************************************
 * Export
 *****************************************************/

const MeasurementUnit = { getById, getAll };
export default MeasurementUnit;