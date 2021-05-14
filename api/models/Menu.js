import Stock from "./Stock.js";
import ModelError from "../../global/ModelError.js";

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- READ ------------------------------------ */
const getAll = async db => {
	const menus = await db.query(`
		SELECT
			menus.menu_id,
			menus.name,
			menus.description,
			mi.stock_id,
			mi.units
		FROM menus
		LEFT JOIN menu_ingredients mi ON menus.menu_id = mi.menu_id
		ORDER BY menus.menu_id
	`);

	return buildFullMenus(db, menus);
};

const getById = async (db, menu_id) => {
	const menu = await db.query(`
		SELECT
			menus.menu_id,
			menus.name,
			menus.description,
			mi.stock_id,
			mi.units
		FROM menus
		LEFT JOIN menu_ingredients mi ON menus.menu_id = mi.menu_id
		WHERE menus.menu_id = ?
	`, [menu_id]);

	if (menu.length === 0) {
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
				description: menu.description,
				ingredients: []
			};

		const stock = await Stock.getById(db, menu.stock_id);

		fullMenu.ingredients.push({
			stock_id: stock.stock_id,
			name: stock.name,
			units: menu.units,
			units_unit: stock.units_unit
		});

		fullMenus.set(menu.menu_id, fullMenu);
	}

	return Array.from(fullMenus).map(([_, menu]) => menu);
};

/*****************************************************
 * Export
 *****************************************************/

const Menu = { getById, getAll };
export default Menu;