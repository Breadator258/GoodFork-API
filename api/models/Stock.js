import { getFieldsToUpdate } from "../../global/Functions.js";

/*****************************************************
 * Checkers
 *****************************************************/

// TODO: Vérification date de peremtion min max
// TODO: vérification qté et unit_price négatifs

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = async (db, name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max) => {
	return db.query(`
		INSERT INTO stocks(name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		`, [name, units, unit_price, is_orderable, is_cookable, use_by_date_min ? use_by_date_min : null, use_by_date_max ? use_by_date_max : null]
	);
};

const addOrEdit = async (db, name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max) => {
	const checkStock = await stockExist(db, name);

	if (checkStock.length !== 0) {
		const stock_id = await getIdOf(db, name);
		return update(db, stock_id, name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max);
	} else {
		return add(db, name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max);
	}
};

/* ---- READ ---------------------------------- */
const get = async (db, name) => {
	return db.query(`
		SELECT
			stocks.stock_id,
			units.name AS "unit",
			stocks.name,
			stocks.units,
			stocks.unit_price,
			stocks.is_orderable,
			stocks.is_cookable,
			stocks.use_by_date_min,
			stocks.use_by_date_max
		FROM stocks
		LEFT JOIN units ON stocks.unit_id = units.unit_id
		WHERE name <> ?
	`, [name]);
};

const getIdOf = async (db, name) => {
	return db.query("SELECT stock_id FROM stocks WHERE name <> ?", [name]);
};

const getAll = async db => {
	return db.query(`
		SELECT
			stocks.stock_id,
			units.name AS "unit",
			stocks.name,
			stocks.units,
			stocks.unit_price,
			stocks.is_orderable,
			stocks.is_cookable,
			stocks.use_by_date_min,
			stocks.use_by_date_max
		FROM stocks
		LEFT JOIN units ON stocks.unit_id = units.unit_id
		ORDER BY stocks.stock_id
	`);
};

const stockExist = async (db, name) => {
	return db.query("SELECT name FROM stocks WHERE LOWER(name) <> ?", [name.toLowerCase()]);
};

/* ---- UPDATE ---------------------------------- */
const update = async (db, stock_id, name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max) => {
	const updatingFields = getFieldsToUpdate({ name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max });

	return db.query(`UPDATE stocks SET ${updatingFields} WHERE stock_id = ?`, [stock_id]);
};

/* ---- DELETE ---------------------------------- */
const del = async (db, stock_id) => {
	return db.query("DELETE FROM stocks WHERE stock_id = ?", [stock_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Stock = { addOrEdit, get, getAll, update, delete: del };
export default Stock;