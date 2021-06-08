/**
 * @module models/Measurement
 * @description Measurement is a module that makes the junction between {@see module:models/MeasurementType} and {@see module:models/MeasurementUnit}.
 */
import converters from "convert-units";
import MeasurementUnit from "./MeasurementUnit.js";
import Checkers from "../../global/Checkers.js";
import ModelError from "../../global/ModelError.js";

/**
 * An un-built Measurement
 * @typedef {Object} UnbuiltMeasurement
 * @property {Number} unit_id - ID of the unit
 * @property {string} name - Unit name
 * @property {Boolean|Number} used_in_stock - Is a valid measurement unit in the stock ?
 * @property {Number} type_id - ID of the type
 * @property {string} type_name - Type name
 * @property {Number} as_ref_unit - How much of this unit relative to the reference unit of its type
 */

/**
 * A Measurement
 * @typedef {Object} Measurement
 * @property {MeasurementUnit} unit - Unit
 * @property {MeasurementType} type - Type
 */

/*****************************************************
 * Conversions table
 *****************************************************/

const conversions = {
	"kg": mass => mass,
	"g": mass => converters(mass).from("kg").to("g"),
	"mg": mass => converters(mass).from("kg").to("mg"),
	"L": volume => volume,
	"cL": volume => converters(volume).from("l").to("cl"),
	"mL": volume => converters(volume).from("l").to("ml"),
	"oz": mass => converters(mass).from("kg").to("oz"),
	"lb": mass => converters(mass).from("kg").to("lb"),
	"qt": volume => volume,
	"fl-oz": volume => converters(volume).from("l").to("fl-oz"),
	"cuill. café": value => converters(value).from("kg").to("g") / 5,
	"cuill. soupe": value => converters(value).from("kg").to("g") / 15,
	"noisette": mass => converters(mass).from("kg").to("g") / 4,
	"noix": mass => converters(mass).from("kg").to("g") / 15,
	"stick de beurre": mass => converters(mass).from("kg").to("g") / 113,
	"1 cup": volume => converters(volume).from("l").to("ml") / 250,
	"1/2 cup": volume => converters(volume).from("l").to("ml") / 125,
	"1/3 cup": volume => converters(volume).from("l").to("ml") / 80,
	"1/4 cup": volume => converters(volume).from("l").to("ml") / 60,
	"pincée": mass => converters(mass).from("kg").to("g") / 5
};

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- READ ---------------------------------- */
/**
 * @async
 * @function getById
 * @description Get a measurement by its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} unit_id - unit_id - ID of the unit
 * @returns {Promise<MeasurementUnit>} A measurement
 *
 * @example
 * 	Measurement.getById(db, 12)
 */
const getById = async (db, unit_id) => {
	const measurement = await db.query(`
		SELECT
			mu.unit_id,
			mu.name,
			mu.used_in_stock,
			mt.type_id,
			mt.ref_unit_id,
			mt.name AS "type_name",
			mut.as_ref_unit
		FROM measurement_units_types mut
		INNER JOIN measurement_units mu ON mut.unit_id = mu.unit_id
		INNER JOIN measurement_types mt ON mut.type_id = mt.type_id
		WHERE mu.unit_id = ?
	`, [unit_id]);

	return measurement[0]
		? buildMeasurement(db, measurement[0])
		: new ModelError(400, `Aucune unité de mesure n'a été trouvée avec l'ID "${unit_id}"`);
};

/**
 * @async
 * @function getByName
 * @description Get a measurement by its name
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} name - Unit name
 * @returns {Promise<MeasurementUnit>} A measurement
 *
 * @example
 * 	Measurement.getByName(db, "kg")
 */
const getByName = async (db, name) => {
	const measurement = await db.query(`
		SELECT
			mu.unit_id,
			mu.name,
			mu.used_in_stock,
			mt.type_id,
			mt.ref_unit_id,
			mt.name AS "type_name",
			mut.as_ref_unit
		FROM measurement_units_types mut
		INNER JOIN measurement_units mu ON mut.unit_id = mu.unit_id
		INNER JOIN measurement_types mt ON mut.type_id = mt.type_id
		WHERE mu.name = ?
	`, [name]);

	return measurement[0]
		? buildMeasurement(db, measurement[0])
		: new ModelError(400, `Aucune unité de mesure n'a été trouvée avec le nom "${name}"`);
};

/**
 * @async
 * @function getAll
 * @description Get all measurement
 *
 * @param {Promise<void>} db - Database connection
 * @param {Boolean} forStock - It is needed to exclude units that should not be showed in stock
 * @returns {Promise<Array<MeasurementUnit>>} A list of measurement
 *
 * @example
 * 	Measurement.getAll(db)
 */
const getAll = async (db, forStock) => {
	const measurements = await db.query(`
		SELECT
			mu.unit_id,
			mu.name,
			mu.used_in_stock,
			mt.type_id,
			mt.ref_unit_id,
			mt.name AS "type_name",
			mut.as_ref_unit
		FROM measurement_units_types mut
		INNER JOIN measurement_units mu ON mut.unit_id = mu.unit_id
		INNER JOIN measurement_types mt ON mut.type_id = mt.type_id
		${forStock ? "WHERE mu.used_in_stock = 1" : ""}
		ORDER BY mut.mut_id
	`);

	return buildMeasurement(db, measurements);
};

/**
 * @async
 * @function getAllByTypes
 * @description Get all measurement ordered by types
 *
 * @param {Promise<void>} db - Database connection
 * @param {Boolean} forStock - It is needed to exclude units that should not be showed in stock
 * @returns {Promise<Object<Array<MeasurementUnit>>>} A list of measurement ordered by types
 *
 * @example
 * 	Measurement.getAllByTypes(db)
 */
const getAllByTypes = async (db, forStock) => {
	const measurements = await db.query(`
		SELECT
			mu.unit_id,
			mu.name,
			mu.used_in_stock,
			mt.type_id,
			mt.ref_unit_id,
			mt.name AS "type_name",
			mut.as_ref_unit
		FROM measurement_units_types mut
		INNER JOIN measurement_units mu ON mut.unit_id = mu.unit_id
		INNER JOIN measurement_types mt ON mut.type_id = mt.type_id
		${forStock ? "WHERE mu.used_in_stock = 1" : ""}
		ORDER BY mut.mut_id
	`);

	return buildMeasurement(db, measurements, true);
};

/**
 * @async
 * @function convert
 * @description Convert a measurement unit to another one
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number} value - The value to convert
 * @param {string} from - Current measurement unit of the value
 * @param {string} to - Wanted measurement unit for the value
 * @returns {Promise<Number|ModelError>} The converted value or a ModelError
 *
 * @example
 * 	Measurement.convert(db, 1, "kg", "cuill. soupe")
 */
const convert = async (db, value, from, to) => {
	if (from === to) return value;

	const fromUnit = await getByName(db, from);
	const toUnit = await getByName(db, to);

	// Return a model error if one of the unit doesn't exist
	if (fromUnit instanceof ModelError) return fromUnit;
	if (toUnit instanceof ModelError) return toUnit;

	// Return a model error if one of the unit is a part of "other" type.
	if (fromUnit.type.name === "autre") return new ModelError(400, `L'unité "${fromUnit.unit.name}" ne peut pas être convertie.`);
	if (toUnit.type.name === "autre") return new ModelError(400, `L'unité "${toUnit.unit.name}" ne peut pas être convertie.`);

	// Convert the value to the reference unit
	const fromRefUnit = value * fromUnit.unit.as_ref_unit;

	// Tries to convert to the wanted unit
	if (!Object.prototype.hasOwnProperty.call(conversions, toUnit.unit.name)) {
		return new ModelError(400, `Impossible de convertir de "${fromUnit.unit.name}" (${fromUnit.type.name}) vers "${toUnit.unit.name}" (${fromUnit.type.name}).`);
	}

	return conversions[toUnit.unit.name](fromRefUnit);
};

/**
 * @function buildMeasurement
 * @description Replace foreign keys by the corresponding data
 *
 * @param {Promise<void>} db - Database connection
 * @param {Array<UnbuiltMeasurement>|UnbuiltMeasurement} measurements - One or multiple measurement unit and type
 * @param {Boolean} groupByType - Group by measurements types or not
 * @returns {Promise<Array<Measurement>|Measurement>} One or multiple measurements
 *
 * @example
 * 	Measurement.buildMeasurement(db, [<UnbuiltMeasurement>, <UnbuiltMeasurement>, ...])
 *Measurement.buildMeasurement(db, <UnbuiltMeasurement>)
 */
const buildMeasurement = async (db, measurements, groupByType = false) => {
	const build = async measurement => {
		const refUnit = await MeasurementUnit.getById(db, measurement.ref_unit_id);

		return {
			unit: {
				unit_id: measurement.unit_id,
				name: measurement.name,
				used_in_stock: measurement.used_in_stock,
				as_ref_unit: measurement.as_ref_unit
			},
			type: {
				type_id: measurement.type_id,
				ref_unit_id: measurement.ref_unit_id,
				ref_unit: refUnit.name,
				name: measurement.type_name
			}
		};
	};

	const measurementsTypes = {};

	if (Checkers.isArray(measurements)) {
		const fullMeasurements = [];

		for (const measurement of measurements) {

			if (groupByType) {
				if (!Object.prototype.hasOwnProperty.call(measurementsTypes, measurement.type_name)) {
					measurementsTypes[measurement.type_name] = [];
				}

				measurementsTypes[measurement.type_name].push(await build(measurement));
			} else {
				fullMeasurements.push(await build(measurement));
			}
		}

		return groupByType ? measurementsTypes : fullMeasurements;
	} else {
		if (groupByType) {
			measurementsTypes[measurements.type_name] = await build(measurements);
		}

		return groupByType ? measurementsTypes : await build(measurements);
	}
};

/*****************************************************
 * Export
 *****************************************************/

const Measurement = { getById, getByName, getAll, getAllByTypes, convert };
export default Measurement;