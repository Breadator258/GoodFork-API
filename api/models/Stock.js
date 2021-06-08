/** @module models/Stock */
import { getFieldsToUpdate } from "../../global/Functions.js";
import Measurement from "./Measurement.js";
import ModelError from "../../global/ModelError.js";
import Checkers from "../../global/Checkers.js";

/**
 * A Stock item
 * @typedef {Object} StockItem
 * @property {Number} stock_id - ID of the stock item
 * @property {string} name - Item name
 * @property {Number} units - How many/much of this item
 * @property {Number} units_unit_id - ID of the unit associated to "units" property {@see Unit}
 * @property {Number} unit_price - Price of one unit of this item
 * @property {Boolean} is_orderable - Can a user order it
 * @property {Boolean} is_cookable - Can a cook cook it
 * @property {Date|string} use_by_date_min - When this item will be spoiled (min. bound)
 * @property {Date|string} use_by_date_max - When this item will be spoiled (max. bound)
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
/**
 * @function add
 * @async
 * @description Add a stock item
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} name - Item name
 * @param {Number} units - How many/much of this item
 * @param {Number|string} units_unit_id - ID of the unit associated to "units" property {@see Unit}
 * @param {Number} unit_price - Price of one unit of this item
 * @param {Boolean} is_orderable - Can a user order it
 * @param {Boolean} is_cookable - Can a cook cook it
 * @param {Date|string} use_by_date_min - When this item will be spoiled (min. bound)
 * @param {Date|string} use_by_date_max - When this item will be spoiled (max. bound)
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Stock.add(db, "Huile d'olive 2000% matières grasses", 50, 5, 1.30, false, true, Date.now(), null)
 */
const add = async (db, name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max) => {
	if (!Checkers.strInRange(name, null, 255)) {
		return new ModelError(400, "Vous devez fournir un nom valide. (max. 255 caractères).", ["name"]);
	}

	if (!Checkers.isDateLowerThan(use_by_date_min, use_by_date_max, true, true)) {
		return new ModelError(400, "Vous devez fournir une date d'expiration valide.", ["use_by_date_min", "use_by_date_max"]);
	}

	if (!Checkers.isGreaterThan(units, 0, true)) {
		return new ModelError(400, "Vous devez fournir une quantité valide.", ["units"]);
	}

	if (!Checkers.isGreaterThan(unit_price, 0, true)) {
		return new ModelError(400, "Vous devez fournir un prix unitaire valide.", ["unit_price"]);
	}

	// Check if the unit is valid
	const measurement = await Measurement.getById(db, units_unit_id);
	let usableUnitId = units_unit_id;

	if (!measurement.unit.used_in_stock) {
		usableUnitId = measurement.type.ref_unit_id;
	}

	return db.query(`
		INSERT INTO stocks(name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, [name, units, usableUnitId, unit_price, is_orderable, is_cookable, use_by_date_min ? use_by_date_min : null, use_by_date_max ? use_by_date_max : null]
	);
};

/**
 * @function addOrEdit
 * @async
 * @description Add a stock item if it doesn't exist, update it otherwise
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} name - Item name
 * @param {Number} units - How many/much of this item
 * @param {Number|string} units_unit_id - ID of the unit associated to "units" property {@see Unit}
 * @param {Number} unit_price - Price of one unit of this item
 * @param {Boolean} is_orderable - Can a user order it
 * @param {Boolean} is_cookable - Can a cook cook it
 * @param {Date|string} use_by_date_min - When this item will be spoiled (min. bound)
 * @param {Date|string} use_by_date_max - When this item will be spoiled (max. bound)
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Stock.addOrEdit(db, "Huile d'olive 2000% matières grasses", 50, 5, 1.30, false, true, Date.now(), null)
 */
const addOrEdit = async (db, name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max) => {
	const stock_id = await getIdOf(db, name);

	if (stock_id) {
		return update(db, stock_id, name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max);
	} else {
		return add(db, name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max);
	}
};

/* ---- READ ---------------------------------- */
/**
 * @function getByName
 * @async
 * @description Get an item by its name
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} name - Item name
 * @returns {Promise<StockItem|ModelError>} An item or a ModelError
 *
 * @example
 * 	Stock.getByName(db, "Huile d'olive 2000% matières grasses")
 */
const getByName = async (db, name) => {
	const stock = await db.query(`
		SELECT
			stocks.stock_id,
			stocks.name,
			stocks.units,
			mu.unit_id AS "units_unit_id",
			mu.name AS "units_unit",
			stocks.unit_price,
			stocks.is_orderable,
			stocks.is_cookable,
			stocks.use_by_date_min,
			stocks.use_by_date_max
		FROM stocks
		LEFT JOIN measurement_units mu ON stocks.units_unit_id = mu.unit_id
		WHERE stocks.name = ?
	`, [name]);

	return stock[0] ? stock[0] : new ModelError(404, `Aucun élément n'a été trouvé avec le nom "${name}".`, ["name"]);
};

/**
 * @function getById
 * @async
 * @description Get an item by its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} stock_id - ID of the stock item
 * @returns {Promise<StockItem|ModelError>} An item or a ModelError
 *
 * @example
 * 	Stock.getByName(db, 27)
 */
const getById = async (db, stock_id) => {
	const stock = await db.query(`
		SELECT
			stocks.stock_id,
			stocks.name,
			stocks.units,
			mu.unit_id AS "units_unit_id",
			mu.name AS "units_unit",
			stocks.unit_price,
			stocks.is_orderable,
			stocks.is_cookable,
			stocks.use_by_date_min,
			stocks.use_by_date_max
		FROM stocks
		LEFT JOIN measurement_units mu ON stocks.units_unit_id = mu.unit_id
		WHERE stocks.stock_id = ?
	`, [stock_id]);

	return stock[0] ? stock[0] : new ModelError(404, `Aucun élément n'a été trouvé avec l'ID "${stock_id}".`);
};

/**
 * @function getIdOf
 * @async
 * @description Get an item ID using its name
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} name - Item name
 * @returns {Promise<Number|null>} The item ID or null
 *
 * @example
 * 	Stock.getIdOf(db, "Huile d'olive 2000% matières grasses")
 */
const getIdOf = async (db, name) => {
	const item = await db.query("SELECT stock_id FROM stocks WHERE name = ?", [name]);

	return item[0] ? item[0].stock_id : null;
};

/**
 * @function getAll
 * @async
 * @description Get all stock items
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<StockItem>>} A list of items
 *
 * @example
 * 	Stock.getAll(db)
 */
const getAll = async db => {
	return db.query(`
		SELECT
			stocks.stock_id,
			stocks.name,
			stocks.units,
			mu.unit_id AS "units_unit_id",
			mu.name AS "units_unit",
			stocks.unit_price,
			stocks.is_orderable,
			stocks.is_cookable,
			stocks.use_by_date_min,
			stocks.use_by_date_max
		FROM stocks
		LEFT JOIN measurement_units mu ON stocks.units_unit_id = mu.unit_id
		ORDER BY stocks.stock_id
	`);
};

/* ---- UPDATE ---------------------------------- */
/**
 * @function update
 * @async
 * @description Update a stock item using its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number} stock_id - ID of the stock item
 * @param {string} name - Item name
 * @param {Number} units - How many/much of this item
 * @param {Number|string} units_unit_id - ID of the unit associated to "units" property {@see Unit}
 * @param {Number} unit_price - Price of one unit of this item
 * @param {Boolean} is_orderable - Can a user order it
 * @param {Boolean} is_cookable - Can a cook cook it
 * @param {Date|string} use_by_date_min - When this item will be spoiled (min. bound)
 * @param {Date|string} use_by_date_max - When this item will be spoiled (max. bound)
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Stock.update(db, 27, null, 750, null, null, null, null, null, null)
 */
const update = async (db, stock_id, name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max) => {
	if (!Checkers.strInRange(name, null, 255, true, true)) {
		return new ModelError(400, "Vous devez fournir un nom valide. (max. 255 caractères).", ["name"]);
	}

	if (!Checkers.isDateLowerThan(use_by_date_min, use_by_date_max, true, true)) {
		return new ModelError(400, "Vous devez fournir une date d'expiration valide.", ["use_by_date_min", "use_by_date_max"]);
	}

	if (units && !Checkers.isGreaterThan(units, 0, true)) {
		return new ModelError(400, "Vous devez fournir une quantité valide.", ["units"]);
	}

	if (unit_price && !Checkers.isGreaterThan(unit_price, 0, true)) {
		return new ModelError(400, "Vous devez fournir un prix unitaire valide.", ["unit_price"]);
	}

	const updatingFields = getFieldsToUpdate({ name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max });
	if (!updatingFields) return new ModelError(200, "Rien à mettre à jour.");

	return db.query(`UPDATE stocks SET ${updatingFields} WHERE stock_id = ?`, [stock_id]);
};

/* ---- DELETE ---------------------------------- */
/**
 * @function delete
 * @async
 * @description Delete a stock item using its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number} stock_id - ID of the stock item
 * @returns {Promise<void>}
 *
 * @example
 * 	Stock.delete(db, 27)
 */
const del = async (db, stock_id) => {
	return db.query("DELETE FROM stocks WHERE stock_id = ?", [stock_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Stock = { add, addOrEdit, getByName, getById, getAll, update, delete: del };
export default Stock;