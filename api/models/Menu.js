/** @module models/Menu */
import { getFieldsToUpdate } from "../../global/Functions.js";
import Stock from "./Stock.js";
import MenuTypes from "./MenuTypes.js";
import Measurement from "./Measurement.js";
import ModelError from "../../global/ModelError.js";
import Checkers from "../../global/Checkers.js";

/**
 * A Menu
 * @typedef {Object} Menu
 * @see {@link module:models/MenuTypes}
 *
 * @property {Number} menu_id - ID of the menu
 * @property {Number} type_id - ID of the menu type
 * @property {string} name - Menu name
 * @property {string} [description] - Menu description
 * @property {Number} price - Menu price
 * @property {string} [image_path] - Illustration
 */

/**
 * A Full Menu
 * @typedef {Object} MenuFull
 * @see {@link module:models/MenuTypes}
 *
 * @property {Number} menu_id - ID of the menu
 * @property {Number} type_id - ID of the menu type
 * @property {string} type - Type of the menu
 * @property {string} name - Menu name
 * @property {string} [description] - Menu description
 * @property {Number} price - Menu price
 * @property {string} [image_path] - Illustration
 * @property {Array<MenuFullIngredient>} ingredients - Ingredients
 */

/**
 * A Menu ingredient
 * @typedef {Object} MenuIngredient
 * @see {@link module:models/Menu}
 * @see {@link module:models/Measurement}
 *
 * @property {Number} ingredient_id - ID of the ingredient
 * @property {Number} menu_id - ID of the menu
 * @property {Number} stock_id - ID of the stock element corresponding to this ingredient
 * @property {Number} units - How many/much of this ingredient
 * @property {Number} units_unit_id - ID of the unit associated to "units" property
 */

/**
 * A Menu full ingredient
 * @typedef {Object} MenuFullIngredient
 * @see {@link module:models/Measurement}
 *
 * @property {Number} ingredient_id - ID of the ingredient
 * @property {Number} stock_id - ID of the stock element corresponding to this ingredient
 * @property {string} name - Name of the stock element corresponding to this ingredient
 * @property {Number} units - How many/much of this ingredient
 * @property {string} units_unit - Unit associated to "units" property
 * @property {Number} units_unit_id - ID of the unit associated to "units" property
 * @property {string} stock_units_unit - Stock unit associated to "units" property
 * @property {Number} stock_units_unit_id - Stock unit ID of the unit associated to "units" property
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
/**
 * @async
 * @function add
 * @description Add a menu
 * @see {@link module:models/MenuTypes}
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} type - Type of the menu
 * @param {string} name - Menu name
 * @param {string} [description] - Menu description
 * @param {Number} price - Menu price
 * @returns {Promise<{menu_id: Number}|ModelError>} The newly added menu ID or a ModelError
 *
 * @example
 * 	Menu.add(db, "entrée", "Côte de porc sur son lit de ketchup", "Miam, c'est bon", 300)
 */
const add = async (db, type, name, description, price) => {
	if (!Checkers.strInRange(name, null, 255, true, true)) {
		return new ModelError(400, "Vous devez fournir un nom valide. (max. 255 caractères).", ["name"]);
	}

	if (!Checkers.strInRange(description, null, 255, true, true)) {
		return new ModelError(400, "La description ne peut pas dépasser 255 caractères.", ["description"]);
	}

	if (Checkers.isDefined(price)) {
		if (! Checkers.isGreaterThan(price, 0, true)) {
			return new ModelError(400, "Vous devez fournir un prix valide.", ["price"]);
		}
	}

	const t = await MenuTypes.getByName(db, type);
	if (t instanceof ModelError) { return t; }

	const type_id = t ? t.type_id : null;

	const menu = await db.query(`
		INSERT INTO menus(type_id, name, description, price)
		VALUES (?, ?, ?, ?)
	`, [type_id, name ?? "Nouveau plat", description ?? null, price ?? 0]
	);

	return { menu_id: menu.insertId };
};

/**
 * @async
 * @function addIngredient
 * @description Add an ingredient in a menu
 * @see {@link module:models/Measurement}
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number} menu_id - ID of the menu
 * @param {string} name - Name of the ingredient
 * @param {Number} units - How many/much of this ingredient
 * @param {Number|string} units_unit_id - ID of the unit associated to "units" property
 * @returns {Promise<{ingredient_id: Number}|ModelError>} The newly added ingredient ID or a ModelError
 *
 * @example
 * 	Menu.addIngredient(db, 7, "Beurre", 4, "kg")
 */
const addIngredient = async (db, menu_id, name, units, units_unit_id) => {
	if (!Checkers.isGreaterThan(units, 0, true)) {
		return new ModelError(400, "Vous devez fournir une quantité valide.", ["units"]);
	}

	// Check if the stock item already exist
	let stockItem = await Stock.getByName(db, name);
	let stockId = stockItem ? stockItem.stock_id : null;

	// Add it otherwise
	if (!stockId) {
		const newItem = await Stock.add(db, name, 0, units_unit_id, 0, false, false, null, null);

		stockId = newItem.insertId;
		stockItem = await Stock.getById(db, stockId);
	}

	// Check if the ingredient unit match his parent
	const ingredientMeasurement = await Measurement.getById(db, units_unit_id);
	const stockMeasurement = await Measurement.getById(db, stockItem.units_unit_id);

	if (ingredientMeasurement.type.name !== stockMeasurement.type.name) {
		return new ModelError(400, `Cet élément du stock utilise les "${stockMeasurement.unit.name}" (${stockMeasurement.type.name}) comme unité de mesure. Vous ne pouvez pas quantifier l'ingrédient avec l'unité "${ingredientMeasurement.unit.name}" (${ingredientMeasurement.type.name}).`);
	}

	const ingredient = await  db.query(`
		INSERT INTO menu_ingredients(menu_id, stock_id, units, units_unit_id)
		VALUES (?, ?, ?, ?)
	`, [menu_id, stockId, units, units_unit_id]
	);

	return { ingredient_id: ingredient.insertId };
};

/* ---- READ ------------------------------------ */
const validOrderBy = ["menu_id", "name", "type_id", "price"];

/**
 * @async
 * @function getAll
 * @description Get all menus
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} [orderBy] - One of ["menu_id", "name", "type_id", "price"]
 * @returns {Promise<Array<Menu>>} A list of menus or a ModelError
 *
 * @example
 * 	Menu.getAll(db)
 *Menu.getAll(db, "name")
 */
const getAll = async (db, orderBy) => {
	const order = orderBy
		? validOrderBy.includes(orderBy.toLowerCase()) ?  `menus.${orderBy}` : "menus.menu_id"
		: "menus.menu_id";

	const menus = await db.query(`
		SELECT
			menus.menu_id,
			menus.name,
			mt.type_id,
			mt.name AS "type",
			menus.description,
			menus.price,
			menus.image_path,
			mi.ingredient_id,
			mi.stock_id,
			mi.units,
			mu.unit_id AS "units_unit_id",
			mu.name AS "units_unit"
		FROM menus
		LEFT JOIN menu_ingredients mi ON menus.menu_id = mi.menu_id
		LEFT JOIN measurement_units mu ON mi.units_unit_id = mu.unit_id
		LEFT JOIN menu_types mt ON menus.type_id = mt.type_id
		ORDER BY ${order}
	`);

	return buildMenus(db, menus);
};

/**
 * @async
 * @function getAllNames
 * @description Get all menus names
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<string>>} A list of menus names
 *
 * @example
 * 	Menu.getAllNames(db)
 */
const getAllNames = async (db) => {
	return await db.query("SELECT name FROM menus ORDER BY menu_id");
};

/**
 * @async
 * @function getById
 * @description Get a menu by its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} menu_id - ID of the menu
 * @returns {Promise<Menu|ModelError>} A menu or a ModelError
 *
 * @example
 * 	Menu.getById(db, 7)
 */
const getById = async (db, menu_id) => {
	const menu = await db.query(`
		SELECT
			menus.menu_id,
			menus.name,
			mt.type_id,
			mt.name AS "type",
			menus.description,
			menus.price,
			menus.image_path,
			mi.ingredient_id,
			mi.stock_id,
			mi.units,
			mu.unit_id AS "units_unit_id",
			mu.name AS "units_unit"
		FROM menus
		LEFT JOIN menu_ingredients mi ON menus.menu_id = mi.menu_id
		LEFT JOIN measurement_units mu ON mi.units_unit_id = mu.unit_id
		LEFT JOIN menu_types mt ON menus.type_id = mt.type_id
		WHERE menus.menu_id = ?
	`, [menu_id]);

	if (!menu[0]) {
		return new ModelError(404, `Aucun menu n'a été trouvée avec l'ID "${menu_id}".`);
	}

	const fullMenu = await buildMenus(db, menu);
	return fullMenu[0];
};

/**
 * @async
 * @function buildMenus
 * @description Replace foreign keys by the corresponding data
 *
 * @param {Promise<void>} db - Database connection
 * @param {Array<Menu>|Menu} menus - One or multiple menus
 * @returns {Promise<Array<MenuFull>|MenuFull>} One or multiple full menus
 *
 * @example
 * 	Menus.buildMenus(db, [<Menu>, ...])
 *Booking.buildMenus(db, <Menu>)
 */
const buildMenus = async (db, menus) => {
	const fullMenus = new Map();

	const build = async menu => {
		const fullMenu = fullMenus.has(menu.menu_id)
			? fullMenus.get(menu.menu_id)
			: {
				menu_id: menu.menu_id,
				name: menu.name,
				type: menu.type,
				type_id: menu.type_id,
				description: menu.description,
				price: menu.price,
				image_path: menu.image_path,
				ingredients: [],
				how_much: null
			};

		if (menu.stock_id) {
			const stock = await Stock.getById(db, menu.stock_id);
			const quantityConversion = await Measurement.convert(db, menu.units, menu.units_unit, stock.units_unit);
			const howMuch = stock.units / quantityConversion;

			if (!fullMenu.how_much) fullMenu.how_much = howMuch;
			else if (howMuch < fullMenu.how_much) {
				fullMenu.how_much = Math.floor(howMuch);
			}

			fullMenu.ingredients.push({
				ingredient_id: menu.ingredient_id,
				stock_id: stock.stock_id,
				name: stock.name,
				units: menu.units,
				units_unit: menu.units_unit,
				units_unit_id: menu.units_unit_id,
				stock_units_unit: stock.units_unit,
				stock_units_unit_id: stock.units_unit_id,
				unit_price: stock.unit_price
			});
		}

		fullMenus.set(menu.menu_id, fullMenu);
	};

	if (Checkers.isArray(menus)) {
		for (const menu of menus) {
			await build(menu);
		}

		return Array.from(fullMenus).map(([_, menu]) => menu);
	} else {
		await build(menus);

		return fullMenus.values().next().value;
	}
};

/* ---- UPDATE ---------------------------------- */
/**
 * @async
 * @function update
 * @description Update a menu
 * @see {@link module:models/MenuTypes}
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} menu_id - ID of the menu
 * @param {Number|string} [type_id] - ID of the menu type
 * @param {string} [name] - Menu name
 * @param {string} [description] - Menu description
 * @param {Number} [price] - Menu price
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Menu.update(db, 7, null, null, 15)
 */
const update = async (db, menu_id, type_id, name, description, price) => {
	if (!Checkers.strInRange(name, null, 255, true, true)) {
		return new ModelError(400, "Vous devez fournir un nom valide. (max. 255 caractères).", ["name"]);
	}

	if (!Checkers.strInRange(description, null, 255, true, true)) {
		return new ModelError(400, "La description ne peut pas dépasser 255 caractères.", ["description"]);
	}

	if (price && !Checkers.isGreaterThan(price, 0, true)) {
		return new ModelError(400, "Vous devez fournir un prix valide.", ["price"]);
	}

	const updatingFields = getFieldsToUpdate({ type_id, name, description, price });
	if (!updatingFields) return;

	return db.query(`UPDATE menus SET ${updatingFields} WHERE menu_id = ?`, [menu_id]);
};

/**
 * @async
 * @function setIllustration
 * @description Update a menu illustration
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} menu_id - ID of the menu
 * @param {string} image_path - Illustration
 * @returns {Promise<void>}
 *
 * @example
 * 	Menu.setIllustration(db, 7, "https://i.imgur.com/UZR5L98.jpg")
 */
const setIllustration = async (db, menu_id, image_path) => {
	return db.query("UPDATE menus SET image_path = ? WHERE menu_id = ?", [image_path, menu_id]);
};

/**
 * @async
 * @function updateIngredient
 * @description Update a menu
 * @see {@link module:models/Measurement}
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} ingredient_id - ID of the ingredient
 * @param {string} [name] - Name of the stock element corresponding to this ingredient
 * @param {Number} units - How many/much of this ingredient
 * @param {Number|string} units_unit_id - ID of the unit associated to "units" property
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Menu.updateIngredient(db, 15, null, 15, null)
 */
const updateIngredient = async (db, ingredient_id, name, units, units_unit_id) => {
	if (units && !Checkers.isGreaterThan(units, 0, true)) {
		return new ModelError(400, "Vous devez fournir une quantité valide.", ["units"]);
	}

	// Check if the stock item already exist
	let stockItem = await Stock.getByName(db, name);
	let stockId = stockItem ? stockItem.stock_id : null;

	// Add it otherwise
	if (!stockId) {
		const newItem = await Stock.add(db, name, 0, units_unit_id, 0, false, false, null, null);

		stockId = newItem.insertId;
		stockItem = await Stock.getById(db, stockId);
	}

	// Check if the ingredient unit match his parent
	const ingredientMeasurement = await Measurement.getById(db, units_unit_id);
	const stockMeasurement = await Measurement.getById(db, stockItem.units_unit_id);

	if (ingredientMeasurement.type.name !== stockMeasurement.type.name) {
		return new ModelError(400, `Cet élément du stock utilise les "${stockMeasurement.unit.name}" (${stockMeasurement.type.name}) comme unité de mesure. Vous ne pouvez pas quantifier l'ingrédient avec l'unité "${ingredientMeasurement.unit.name}" (${ingredientMeasurement.type.name}).`);
	}

	const updatingFields = getFieldsToUpdate({ stock_id: stockId, units, units_unit_id });
	if (!updatingFields) return new ModelError(200, "Rien à mettre à jour.");

	return db.query(`UPDATE menu_ingredients SET ${updatingFields} WHERE ingredient_id = ?`, [ingredient_id]);
};

/* ---- DELETE ---------------------------------- */
/**
 * @async
 * @function delete
 * @description Delete a menu
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} menu_id - ID of the menu
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Menu.delete(db, 7)
 */
const del = async (db, menu_id) => {
	return db.query("DELETE FROM menus WHERE menu_id = ?", [menu_id]);
};

/**
 * @async
 * @function deleteIngredient
 * @description Delete a menu ingredient
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} ingredient_id - ID of the ingredient
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Menu.deleteIngredient(db, 15)
 */
const delIngredient = async (db, ingredient_id) => {
	return db.query("DELETE FROM menu_ingredients WHERE ingredient_id = ?", [ingredient_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Menu = {
	add,
	addIngredient,
	getById,
	getAll,
	getAllNames,
	update,
	setIllustration,
	updateIngredient,
	delete: del,
	deleteIngredient: delIngredient
};
export default Menu;