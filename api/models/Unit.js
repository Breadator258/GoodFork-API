/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- READ ---------------------------------- */
const getAll = async db => {
	return db.query("SELECT unit_id, name FROM units ORDER BY unit_id");
};

/*****************************************************
 * Export
 *****************************************************/

const Unit = { getAll };
export default Unit;