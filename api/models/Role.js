/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- READ ---------------------------------- */
const getAll = async db => {
	return db.query("SELECT role_id, name FROM roles ORDER BY role_id");
};

/*****************************************************
 * Export
 *****************************************************/

const Role = { getAll };
export default Role;