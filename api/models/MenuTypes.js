import ModelError from "../../global/ModelError.js";

/*****************************************************
 * CRUD Methods
 *****************************************************/
/* ---- READ ------------------------------------ */
const getByName = async (db, name) => {
	const type = await db.query(`
		SELECT
			type_id, name
		FROM menu_types
		WHERE name = ?
	`, [name]);

	return type[0] ? type[0] : new ModelError(404, "No type found with this name.");
};

const getAll = async db => {
	return db.query(`
		SELECT
			type_id, name
		FROM menu_types
		ORDER BY type_id
	`);
};

/*****************************************************
 * Export
 *****************************************************/

const MenuTypes = { getByName, getAll };
export default MenuTypes;