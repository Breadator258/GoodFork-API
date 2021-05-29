import Checkers from "../../global/Checkers.js";
import ModelError from "../../global/ModelError.js";

/*****************************************************
 * CRUD Methods
 *****************************************************/
/* ---- CREATE ---------------------------------- */

const addMultiple = async (db, order_id, menus) => {
	if (!Checkers.isArray(menus)) {
		return new ModelError(400, "You must provide a valid menus list.");
	}

	const valuesPlaceholders = [];
	const values = [];

	menus.map(menu => {
		valuesPlaceholders.push("(?, ?)");
		values.push(order_id, menu.menu_id);
	});

	return db.query(`
		INSERT INTO orders_menus(order_id, menu_id)
		VALUES ${valuesPlaceholders.join(", ")}
		`, values
	);
};

/*****************************************************
 * Export
 *****************************************************/

const OrderMenus = { addMultiple };
export default OrderMenus;