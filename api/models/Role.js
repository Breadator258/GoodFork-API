/** @module models/Role */
import ModelError from "../../global/ModelError.js";

/**
 * A Role
 * @typedef {Object} Role
 * @property {Number} role_id - ID of the role
 * @property {string} name - Role name
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- READ ---------------------------------- */
/**
 * @function getByName
 * @async
 * @description Get a role by its name
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} name - Role name
 * @returns {Promise<Role|ModelError>} A role or a ModelError
 *
 * @example
 * 	Role.getByName(db, "owner")
 */
const getByName = async (db, name) => {
	const role = await db.query("SELECT role_id, name FROM roles WHERE name = ? LIMIT 1", [name]);
	return role[0] ? role[0] : new ModelError(404, "No role found with this name.");
};

/**
 * @function getAll
 * @async
 * @description Get all roles
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<Role>>} A list of roles
 *
 * @example
 * 	Role.getAll(db)
 */
const getAll = async db => {
	return db.query("SELECT role_id, name FROM roles ORDER BY role_id");
};

/*****************************************************
 * Export
 *****************************************************/

const Role = { getByName, getAll };
export default Role;