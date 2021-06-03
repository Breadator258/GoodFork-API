import { getFieldsToUpdate } from "../../global/Functions.js";
import Stock from "./Stock.js";
import MenuTypes from "./MenuTypes.js";
import ModelError from "../../global/ModelError.js";
import Checkers from "../../global/Checkers.js";

/*****************************************************
 * CRUD Methods
 *****************************************************/
/* ---- CREATE ---------------------------------- */
const add = async (db, type, name, description, price) => {
	if (!Checkers.strInRange(name, null, 255, true, true)) {
		return new ModelError(400, "You must provide a valid name.", ["name"]);
	}

	if (!Checkers.strInRange(description, null, 255, true, true)) {
		return new ModelError(400, "You must provide a valid description.", ["description"]);
	}

	if (Checkers.isDefined(price)) {
		if (! Checkers.isGreaterThan(price, 0, true)) {
			return new ModelError(400, "You must provide a valid price.", ["price"]);
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

const addIngredient = async (db, menu_id, name, units, units_unit_id) => {
	if (!Checkers.isGreaterThan(units, 0, true)) {
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
const validOrderBy = ["menu_id", "name", "type_id", "price"];
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
			units.unit_id AS "units_unit_id",
			units.name AS "units_unit"
		FROM menus
		LEFT JOIN menu_ingredients mi ON menus.menu_id = mi.menu_id
		LEFT JOIN units ON mi.units_unit_id = units.unit_id
		LEFT JOIN menu_types mt ON menus.type_id = mt.type_id
		ORDER BY ${order}
	`);

	return buildFullMenus(db, menus);
};

const getAllOrdersMenusByUserId = async (db, orderBy, user_id) => {
	const order = orderBy
		? validOrderBy.includes(orderBy.toLowerCase()) ?  `menus.${orderBy}` : "menus.menu_id"
		: "menus.menu_id";

	const menus = await db.query(`
		SELECT
			menus.menu_id,
			menus.name,
			mt.type_id,
			mt.name AS "type",
			menus.price,
			orders.is_finished
		FROM menus
		LEFT JOIN menu_ingredients mi ON menus.menu_id = mi.menu_id
		LEFT JOIN units ON mi.units_unit_id = units.unit_id
		LEFT JOIN menu_types mt ON menus.type_id = mt.type_id
		INNER JOIN orders ON orders.user_id = ${user_id}
		ORDER BY ${order}
	`);

	return buildFullOrderMenus(db, menus);
};

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
				type_id: menu.type_id,
				description: menu.description,
				price: menu.price,
				image_path: menu.image_path,
				ingredients: []
			};

		if (menu.stock_id) {
			const stock = await Stock.getById(db, menu.stock_id);

			fullMenu.ingredients.push({
				ingredient_id: menu.ingredient_id,
				stock_id: stock.stock_id,
				name: stock.name,
				units: menu.units,
				units_unit: menu.units_unit,
				units_unit_id: menu.units_unit_id
			});
		}

		fullMenus.set(menu.menu_id, fullMenu);
	}

	return Array.from(fullMenus).map(([_, menu]) => menu);
};

const buildFullOrderMenus = async (db, menus) => {
	const fullMenus = new Map();

	for (const menu of menus) {
		const fullMenu = {
			menu_id: menu.menu_id,
			name: menu.name,
			type: menu.type,
			type_id: menu.type_id,
			price: menu.price,
			ingredients: [],
			is_finished: menu.is_finished
		};

		fullMenus.set(menu, fullMenu);
	}

	return Array.from(fullMenus).map(([_, menu]) => menu);
};

/* ---- UPDATE ---------------------------------- */
const update = async (db, menu_id, type_id, name, description, price) => {
	if (!Checkers.strInRange(name, null, 255, true, true)) {
		return new ModelError(400, "You must provide a valid menu name (max. 255 characters).", ["name"]);
	}

	if (!Checkers.strInRange(description, null, 255, true, true)) {
		return new ModelError(400, "You must provide a valid menu description (max. 255 characters).", ["description"]);
	}

	if (price && !Checkers.isGreaterThan(price, 0, true)) {
		return new ModelError(400, "You must provide a valid menu price.", ["price"]);
	}

	const updatingFields = getFieldsToUpdate({ type_id, name, description, price });
	if (!updatingFields) return;

	return db.query(`UPDATE menus SET ${updatingFields} WHERE menu_id = ?`, [menu_id]);
};

const setIllustration = async (db, menu_id, image_path) => {
	return db.query("UPDATE menus SET image_path = ? WHERE menu_id = ?", [image_path, menu_id]);
};

const updateIngredient = async (db, ingredient_id, name, units, units_unit_id) => {
	if (units && !Checkers.isGreaterThan(units, 0, true)) {
		return new ModelError(400, "You must provide a valid quantity.", ["units"]);
	}

	const stockItem = Stock.getByName(db, name);
	let stockId = stockItem ? stockItem.stock_id : null;

	if (!stockId) {
		const newItem = await Stock.add(db, name, 0, units_unit_id, 0, false, false, null, null);
		stockId = newItem.insertId;
	}

	const updatingFields = getFieldsToUpdate({ stock_id: stockId, units, units_unit_id });
	if (!updatingFields) return new ModelError(200, "Nothing to update");

	return db.query(`UPDATE menu_ingredients SET ${updatingFields} WHERE ingredient_id = ?`, [ingredient_id]);
};

/* ---- DELETE ---------------------------------- */
const del = async (db, menu_id) => {
	return db.query("DELETE FROM menus WHERE menu_id = ?", [menu_id]);
};

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
	update,
	setIllustration,
	updateIngredient,
	delete: del,
	deleteIngredient:
	delIngredient,
	getAllOrdersMenusByUserId
};
export default Menu;