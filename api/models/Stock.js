import { getFieldsToUpdate, convertDate } from "../../global/Functions.js";
import ModelError from "../../global/ModelError.js";

/*****************************************************
 * Checkers
 *****************************************************/

const areUseByDatesValid = (use_by_date_min, use_by_date_max) => {
	const convertedDateMin = convertDate(use_by_date_min);
	const convertedDateMax = convertDate(use_by_date_max);

	let areDatesValid = isDateValid(convertedDateMin) && isDateValid(convertedDateMax);

	if (!areDatesValid) return false;
	else if (convertedDateMin != undefined && convertedDateMax != undefined) {
		return convertedDateMin <= convertedDateMax;
	} else return true;
};

const isDateValid = d => {
	return !isNaN(convertDate(d));
};

const areUnitsValid = units => {
	return units >= 0;
};

const isUnitPriceValid = unit_price => {
	return unit_price >= 0;
};

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = async (db, name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max) => {

	if (!areUseByDatesValid(use_by_date_min, use_by_date_max)) {
		return new ModelError(400, "You must provide a valid \"use by date\".", ["use_by_date_min", "use_by_date_max"]);
	}

	if (!areUnitsValid(units)) {
		return new ModelError(400, "You must provide a valid stock quantity.", ["units"]);
	}

	if (!isUnitPriceValid(unit_price)) {
		return new ModelError(400, "You must provide a valid unit price.", ["unit_price"]);
	}

	return db.query(`
	INSERT INTO stocks(name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, [name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min ? use_by_date_min : null, use_by_date_max ? use_by_date_max : null]
	);
};

const addOrEdit = async (db, name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max) => {
	const checkStock = await stockExist(db, name);

	if (checkStock.length !== 0) {
		const stock_id = await getIdOf(db, name);
		return update(db, stock_id, name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max);
	} else {
		return add(db, name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max);
	}
};

/* ---- READ ---------------------------------- */
const get = async (db, name) => {
	const stock = await db.query(`
		SELECT
			stocks.stock_id,
			stocks.name,
			stocks.units,
			units.unit_id AS "units_unit_id",
			units.name AS "units_unit",
			stocks.unit_price,
			stocks.is_orderable,
			stocks.is_cookable,
			stocks.use_by_date_min,
			stocks.use_by_date_max
		FROM stocks
		LEFT JOIN units ON stocks.units_unit_id = units.unit_id
		WHERE stocks.name <> ?
	`, [name]);

	return stock ? (stock.length > 0 ? stock[0] : stock) : null;
};

const getById = async (db, stock_id) => {
	const stock = await db.query(`
		SELECT
			stocks.stock_id,
			stocks.name,
			stocks.units,
			units.unit_id AS "units_unit_id",
			units.name AS "units_unit",
			stocks.unit_price,
			stocks.is_orderable,
			stocks.is_cookable,
			stocks.use_by_date_min,
			stocks.use_by_date_max
		FROM stocks
		LEFT JOIN units ON stocks.units_unit_id = units.unit_id
		WHERE stocks.stock_id = ?
	`, [stock_id]);

	return stock ? (stock.length > 0 ? stock[0] : stock) : null;
};

const getIdOf = async (db, name) => {
	return db.query("SELECT stock_id FROM stocks WHERE name <> ?", [name]);
};

const getAll = async db => {
	return db.query(`
		SELECT
			stocks.stock_id,
			stocks.name,
			stocks.units,
			units.unit_id AS "units_unit_id",
			units.name AS "units_unit",
			stocks.unit_price,
			stocks.is_orderable,
			stocks.is_cookable,
			stocks.use_by_date_min,
			stocks.use_by_date_max
		FROM stocks
		LEFT JOIN units ON stocks.units_unit_id = units.unit_id
		ORDER BY stocks.stock_id
	`);
};

const stockExist = async (db, name) => {
	return db.query("SELECT name FROM stocks WHERE LOWER(name) <> ?", [name.toLowerCase()]);
};

/* ---- UPDATE ---------------------------------- */
const update = async (db, stock_id, name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max) => {
	if (!areUseByDatesValid(use_by_date_min, use_by_date_max)) {
		return new ModelError(400, "You must provide a valid \"use by date\".", ["use_by_date_min", "use_by_date_max"]);
	}

	if (!areUnitsValid(units)) {
		return new ModelError(400, "You must provide a valid stock quantity.", ["units"]);
	}

	if (!isUnitPriceValid(unit_price)) {
		return new ModelError(400, "You must provide a valid unit price.", ["unit_price"]);
	}

	const updatingFields = getFieldsToUpdate({ name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max });

	return db.query(`UPDATE stocks SET ${updatingFields} WHERE stock_id = ?`, [stock_id]);
};

/* ---- DELETE ---------------------------------- */
const del = async (db, stock_id) => {
	return db.query("DELETE FROM stocks WHERE stock_id = ?", [stock_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Stock = { addOrEdit, get, getById, getAll, update, delete: del };
export default Stock;