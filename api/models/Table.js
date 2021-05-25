import { getFieldsToUpdate } from "../../global/Functions.js";
import ModelError from "../../global/ModelError.js";
import Checkers from "../../global/Checkers.js";

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = async (db, name, capacity, is_available) => {
	if (!Checkers.strInRange(name, null, 255, true, true)) {
		return new ModelError(400, "You must provide a valid table name (max. 255 characters).", ["name"]);
	}

	if (!Checkers.isGreaterThan(capacity, 0, true)) {
		return new ModelError(400, "You must provide a valid capacity.", ["capacity"]);
	}

	return db.query(`
		INSERT INTO tables(name, capacity, is_available)
		VALUES (?, ?, ?)
		`, [name, capacity, is_available]
	);
};

/* ---- READ ---------------------------------- */
const getAll = async db => {
	return db.query("SELECT table_id, name, capacity, is_available FROM tables ORDER BY table_id");
};

const getById = async (db, table_id) => {
	const table = await db.query("SELECT table_id, name, capacity, is_available FROM tables WHERE table_id = ?", [table_id]);
	return table[0] ? table[0] : new ModelError(404, "No table found with this id.");
};

const getByTableCapacity = async (db, capacity) => {
	const table = await db.query(`
	SELECT table_id, name, capacity, is_available 
	FROM tables 
	WHERE capacity >= ? AND is_available = 1
	ORDER BY capacity
	LIMIT 1`, [capacity]);
	return table[0] ? table[0] : new ModelError(404, "No table found with this capacity.");
};

/* ---- UPDATE ---------------------------------- */
const update = async (db, table_id, name, capacity, is_available) => {
	if (!Checkers.strInRange(name, null, 255, true, true)) {
		return new ModelError(400, "You must provide a valid table name (max. 255 characters).", ["name"]);
	}

	if (capacity && !Checkers.isGreaterThan(capacity, 0, true)) {
		return new ModelError(400, "You must provide a valid capacity.", ["capacity"]);
	}

	const updatingFields = getFieldsToUpdate({ name, capacity, is_available });
	if (!updatingFields) return new ModelError(200, "Nothing to update");

	return db.query(`UPDATE tables SET ${updatingFields} WHERE table_id = ?`, [table_id]);
};

/* ---- DELETE ---------------------------------- */
const del = async (db, table_id) => {
	return db.query("DELETE FROM tables WHERE table_id = ?", [table_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Table = { add, getById, getByTableCapacity, getAll, update, delete: del };
export default Table;