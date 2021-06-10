/**
 * @module models/MeasurementType
 * @description Measurement types are categories used to separate units in distinct groups.
 */

/**
 * A MeasurementType
 * @typedef {Object} MeasurementType
 * @property {Number} type_id - ID of the type
 * @property {Number} ref_unit_id - ID of the unit that is used as a reference in this type
 * @property {string} name - Type name
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- READ ---------------------------------- */
/**
 * @async
 * @function getAll
 * @description Get all measurement types
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<MeasurementType>>} A list of measurement types
 *
 * @example
 * 	MeasurementType.getAll(db)
 */
const getAll = async db => {
	return db.query("SELECT type_id, ref_unit_id, name FROM measurement_types ORDER BY type_id");
};

/*****************************************************
 * Export
 *****************************************************/

const MeasurementType = { getAll };
export default MeasurementType;