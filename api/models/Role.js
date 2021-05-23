import ModelError from "../../global/ModelError.js";

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- READ ---------------------------------- */
const getByName = async (db, name) => {
	const role = await db.query("SELECT role_id, name FROM roles WHERE name = ? LIMIT 1", [name]);
	return role[0] ? role[0] : new ModelError(404, "No role found with this name.");
};

const getAll = async db => {
	return db.query("SELECT role_id, name FROM roles ORDER BY role_id");
};

/*****************************************************
 * Export
 *****************************************************/

const Role = { getByName, getAll };
export default Role;