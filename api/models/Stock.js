import bcrypt from "bcrypt";
import config from "../../config/config.js";
import ModelError from "../../global/ModelError.js";

/*****************************************************
 * Checkers
 *****************************************************/

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const addOrEdit = async (db, name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max) => {
	// Verify if stock already exist
	const checkStock = await stockExist(db, name);
	if(checkStock.length !== 0){
		// Add to found stock
		return db.query(`
		UPDATE stocks SET units = ?, unit_price = ?, isOrderable = ?, isCookable = ?, use_by_date_min = ?, use_by_date_max = ? WHERE name = ?
		`, [units, unit_price, is_orderable, is_cookable, use_by_date_min ? use_by_date_min : null, use_by_date_max ? use_by_date_max : null, name]
		);
	}else{
		// Add the stock
		return db.query(`
		INSERT INTO stocks(stock_id, name, units, unit_price, isOrderable, isCookable, use_by_date_min, use_by_date_max)
		VALUES (default, ?, ?, ?, ?, ?, ?, ?)
		`, [name, units, unit_price, is_orderable, is_cookable, use_by_date_min ? use_by_date_min : null, use_by_date_max ? use_by_date_max : null]
		);
	}
};

/* ---- READ ---------------------------------- */
const stockExist = async (db, name) => {
	// Find the stock
	return db.query(`
    SELECT name FROM stocks WHERE LOWER(name) = ?
    `, [name.toLowerCase()]
	);
};

const get = async (db, name) => {
	// Get the stock
	return db.query(`
    SELECT * FROM stocks WHERE name = ?
    `, [name]
	);
};

/* ---- UPDATE ---------------------------------- */
const updateStock = async (db, newName, name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max) => {
	// Update the stock
	return db.query(`
    UPDATE stocks SET name = ?, units = ?, unit_price = ?, isOrderable = ?, isCookable = ?, use_by_date_min = ?, use_by_date_max = ? WHERE name = ?
    `, [newName, units, unit_price, is_orderable, is_cookable, use_by_date_min ? use_by_date_min : null, use_by_date_max ? use_by_date_max : null, name]
	);
};

/* ---- DELETE ---------------------------------- */
const deleteStock = async (db, name) => {
	// Delete the stock
	return db.query(`
    DELETE FROM stocks WHERE name = ?
    `, [name]
	);
};
/*****************************************************
 * Export
 *****************************************************/

const Stock = { addOrEdit, stockExist, updateStock, deleteStock, get };
export default Stock;