/*****************************************************
 * CRUD Methods
 *****************************************************/
/* ---- READ ------------------------------------ */
const getAll = async db => {
	return  db.query(`
		SELECT
			type_id, name
		FROM menu_types
		ORDER BY type_id
	`);
};

/*****************************************************
 * Export
 *****************************************************/

const MenuTypes = { getAll };
export default MenuTypes;