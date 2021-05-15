import { getFieldsToUpdate } from "../../global/Functions.js";
import ModelError from "../../global/ModelError.js";

/*****************************************************
 * Checkers
 *****************************************************/

const isCapacityValid = capacity => {
	return capacity >= 0;
};

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = async (db, name, capacity, is_available) => {
	if (!isCapacityValid(capacity)) {
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

const get = async (db, table_id) => {
	return db.query("SELECT table_id, name, capacity, is_available FROM tables WHERE table_id = ?", [table_id]);
};

/* ---- UPDATE ---------------------------------- */
const update = async (db, table_id, name, capacity, is_available) => {
	if (!isCapacityValid(capacity)) {
		return new ModelError(400, "You must provide a valid capacity.", ["capacity"]);
	}

	const updatingFields = getFieldsToUpdate({ name, capacity, is_available });

	return db.query(`UPDATE tables SET ${updatingFields} WHERE table_id = ?`, [table_id]);
};

/* ---- DELETE ---------------------------------- */
const del = async (db, table_id) => {
	return db.query("DELETE FROM tables WHERE table_id = ?", [table_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Table = { add, getAll, get, update, delete: del };
export default Table;