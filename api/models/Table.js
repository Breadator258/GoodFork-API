/** @module models/Table */
import { getFieldsToUpdate } from "../../global/Functions.js";
import ModelError from "../../global/ModelError.js";
import Checkers from "../../global/Checkers.js";

/**
 * A Table
 * @typedef {Object} Table
 * @property {Number} table_id - ID of the table
 * @property {string} [name] - Table name
 * @property {Number} capacity - Table capacity
 * @property {Boolean|Number} is_available - Is this table available
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
/**
 * @function add
 * @async
 * @description Add a table
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} [name] - Table name
 * @param {Number} capacity - Table capacity
 * @param {Boolean|Number} [is_available=1] - Is this table available
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Table.add(db, "Table n°4", 6)
 */
const add = async (db, name, capacity, is_available = 1) => {
	if (!Checkers.strInRange(name, null, 255, true, true)) {
		return new ModelError(400, "Vous devez fournir un nom valide. (max. 255 caractères).", ["name"]);
	}

	if (!Checkers.isGreaterThan(capacity, 0, true)) {
		return new ModelError(400, "Vous devez fournir une capacité valide.", ["capacity"]);
	}

	return db.query(`
		INSERT INTO tables(name, capacity, is_available)
		VALUES (?, ?, ?)
		`, [name, capacity, is_available]
	);
};

/* ---- READ ---------------------------------- */
/**
 * @function getById
 * @async
 * @description Get a table by its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number} table_id - ID of the table
 * @returns {Promise<Table|ModelError>} The table or a ModelError
 *
 * @example
 * 	Table.getById(db, 4)
 */
const getById = async (db, table_id) => {
	const table = await db.query("SELECT table_id, name, capacity, is_available FROM tables WHERE table_id = ?", [table_id]);
	return table[0] ? table[0] : new ModelError(404, `Aucune table n'a été trouvée avec l'ID "${table_id}".`);
};

/**
 * @function getByTableCapacity
 * @async
 * @description Get the smallest available table
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number} capacity - Minimum capacity needed
 * @returns {Promise<Table|ModelError>} The table or a ModelError
 *
 * @example
 * 	Table.getByTableCapacity(db, 6)
 */
const getByTableCapacity = async (db, capacity) => {
	const table = await db.query(`
		SELECT table_id, name, capacity, is_available 
		FROM tables 
		WHERE capacity >= ? AND is_available = 1
		ORDER BY capacity
		LIMIT 1`,
	[capacity]);

	return table[0] ? table[0] : new ModelError(404, `Aucune table n'a été trouvée avec une capacité d'au moins ${capacity} personnes.`);
};

/**
 * @function getAll
 * @async
 * @description Get all tables
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<Table>|ModelError>} A list of tables or a ModelError
 *
 * @example
 * 	Table.getAll(db)
 */
const getAll = async db => {
	return db.query("SELECT table_id, name, capacity, is_available FROM tables ORDER BY table_id");
};

/* ---- UPDATE ---------------------------------- */
/**
 * @function update
 * @async
 * @description Update a table using its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} table_id - ID of the table
 * @param {string} [name] - Table name
 * @param {Number} [capacity] - Table capacity
 * @param {Boolean|Number} [is_available] - Is this table available
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Table.update(db, 12, null, 4, null)
 */
const update = async (db, table_id, name, capacity, is_available) => {
	if (!Checkers.strInRange(name, null, 255, true, true)) {
		return new ModelError(400, "Vous devez fournir un nom valide. (max. 255 caractères).", ["name"]);
	}

	if (capacity && !Checkers.isGreaterThan(capacity, 0, true)) {
		return new ModelError(400, "Vous devez fournir une capacité valide.", ["capacity"]);
	}

	const updatingFields = getFieldsToUpdate({ name, capacity, is_available });
	if (!updatingFields) return new ModelError(200, "Rien à mettre à jour.");

	return db.query(`UPDATE tables SET ${updatingFields} WHERE table_id = ?`, [table_id]);
};

/* ---- DELETE ---------------------------------- */
/**
 * @function delete
 * @async
 * @description Delete a table using its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} table_id - ID of the table
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Table.delete(db, 12)
 */
const del = async (db, table_id) => {
	return db.query("DELETE FROM tables WHERE table_id = ?", [table_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Table = { add, getById, getByTableCapacity, getAll, update, delete: del };
export default Table;