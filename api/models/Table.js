import { getFieldsToUpdate } from "../../global/Functions.js";

/*****************************************************
 * Checkers
 *****************************************************/

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = async (db, name, capacity, is_available) => {
	return db.query(`
		INSERT INTO tables(name, capacity, is_available)
		VALUES (?, ?, ?)
		`, [name, capacity, is_available]
	);
};

/* ---- READ ---------------------------------- */

const getAll = async db => {
	return db.query("SELECT table_id, name, capacity, is_available FROM tables");
};

/* ---- UPDATE ---------------------------------- */
const update = async (db, table_id, name, capacity, is_available) => {
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

const Table = { add, getAll, update, delete: del };
export default Table;