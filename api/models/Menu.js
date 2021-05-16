import { getFieldsToUpdate } from "../../global/Functions.js";
import Stock from "./Stock.js";
import ModelError from "../../global/ModelError.js";

/*****************************************************
 * Checkers
 *****************************************************/

const areUnitsValid = units => {
	return units >= 0;
};

/*****************************************************
 * CRUD Methods
 *****************************************************/
/* ---- CREATE ---------------------------------- */
const addIngredient = async (db, menu_id, name, units, units_unit_id) => {
	if (!areUnitsValid(units)) {
		return new ModelError(400, "You must provide a valid quantity.", ["units"]);
	}

	let stockItem = await Stock.getByName(db, name);
	let stockId = stockItem ? stockItem.stock_id : null;

	if (!stockId) {
		const newItem = await Stock.add(db, name, 0, units_unit_id, 0, false, false, null, null);
		stockId = newItem.insertId;
	}

	return db.query(`
		INSERT INTO menu_ingredients(menu_id, stock_id, units, units_unit_id)
		VALUES (?, ?, ?, ?)
	`, [menu_id, stockId, units, units_unit_id]
	);
};

/* ---- READ ------------------------------------ */
const getAll = async db => {
	const menus = await db.query(`
		SELECT
			menus.menu_id,
			menus.name,
			mt.name AS "type",
			menus.description,
			menus.image_path,
			mi.ingredient_id,
			mi.stock_id,
			mi.units,
			units.unit_id AS "units_unit_id",
			units.name AS "units_unit"
		FROM menus
		LEFT JOIN menu_ingredients mi ON menus.menu_id = mi.menu_id
		LEFT JOIN units ON mi.units_unit_id = units.unit_id
		LEFT JOIN menu_types mt ON menus.type_id = mt.type_id
		ORDER BY menus.menu_id
	`);

	return buildFullMenus(db, menus);
};

const getById = async (db, menu_id) => {
	const menu = await db.query(`
		SELECT
			menus.menu_id,
			menus.name,
			mt.name AS "type",
			menus.description,
			menus.image_path,
			mi.ingredient_id,
			mi.stock_id,
			mi.units,
			units.unit_id AS "units_unit_id",
			units.name AS "units_unit"
		FROM menus
		LEFT JOIN menu_ingredients mi ON menus.menu_id = mi.menu_id
		LEFT JOIN units ON mi.units_unit_id = units.unit_id
		LEFT JOIN menu_types mt ON menus.type_id = mt.type_id
		WHERE menus.menu_id = ?
	`, [menu_id]);

	if (!menu[0]) {
		return new ModelError(404, "No menu found with this id.");
	}

	const fullMenu = await buildFullMenus(db, menu);
	return fullMenu[0];
};

const buildFullMenus = async (db, menus) => {
	const fullMenus = new Map();

	for (const menu of menus) {
		const fullMenu = fullMenus.has(menu.menu_id)
			? fullMenus.get(menu.menu_id)
			: {
				menu_id: menu.menu_id,
				name: menu.name,
				type: menu.type,
				image_path: menu.image_path,
				description: menu.description,
				ingredients: []
			};

		const stock = await Stock.getById(db, menu.stock_id);

		fullMenu.ingredients.push({
			ingredient_id: menu.ingredient_id,
			stock_id: stock.stock_id,
			name: stock.name,
			units: menu.units,
			units_unit: menu.units_unit,
			units_unit_id: menu.units_unit_id
		});

		fullMenus.set(menu.menu_id, fullMenu);
	}

	return Array.from(fullMenus).map(([_, menu]) => menu);
};

/* ---- UPDATE ---------------------------------- */
const updateIngredient = async (db, ingredient_id, name, units, units_unit_id) => {
	if (!areUnitsValid(units)) {
		return new ModelError(400, "You must provide a valid quantity.", ["units"]);
	}

	const stockItem = Stock.getByName(db, name);
	let stockId = stockItem ? stockItem.stock_id : null;

	if (!stockId) {
		const newItem = await Stock.add(db, name, 0, units_unit_id, 0, false, false, null, null);
		stockId = newItem.insertId;
	}

	const updatingFields = getFieldsToUpdate({ stock_id: stockId, units, units_unit_id });

	return db.query(`UPDATE menu_ingredients SET ${updatingFields} WHERE ingredient_id = ?`, [ingredient_id]);
};

/* ---- DELETE ---------------------------------- */
const delIngredient = async (db, ingredient_id) => {
	return db.query("DELETE FROM menu_ingredients WHERE ingredient_id = ?", [ingredient_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Menu = { addIngredient, getById, getAll, updateIngredient, deleteIngredient: delIngredient };
export default Menu;