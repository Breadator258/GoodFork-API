import { getFieldsToUpdate } from "../../global/Functions.js";

/*****************************************************
 * Checkers
 *****************************************************/

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = async (db, capacity, is_blocked) => {
	return db.query(`
		INSERT INTO tables(capacity, is_blocked)
		VALUES (?, ?)
		`, [capacity, is_blocked]
	);
};

/* ---- READ ---------------------------------- */

const getAll = async db => {
	return db.query("SELECT table_id, capacity, is_blocked FROM tables");
};

/* ---- UPDATE ---------------------------------- */
const update = async (db, table_id, capacity, is_blocked) => {
	const updatingFields = getFieldsToUpdate({ capacity, is_blocked });

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