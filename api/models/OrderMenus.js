/**
 * @module models/OrderMenus
 * @description OrderMenus is a link between an order and the menus inside it.
 */
import Checkers from "../../global/Checkers.js";
import ModelError from "../../global/ModelError.js";
import Stock from "./Stock.js";

/**
 * An OrderMenu
 * @typedef {Object} OrderMenu
 * @property {Number} content_id - ID used only in the database
 * @property {Number} order_id - ID of the order which contains a menu
 * @property {Number} menu_id - ID of the menu in the order
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
/**
 * @async
 * @function addMultiple
 * @description Add menus in an order
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number} order_id - ID of the order which contains a menu
 * @param {Array<Menu>} menus - The list of menus to add to this order
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	OrderMenus.addMultiple(db, 41, [<Menu>, <Menu>, ...])
 */
const addMultiple = async (db, order_id, menus) => {
	if (!Checkers.isArray(menus)) {
		return new ModelError(400, "Vous devez fournir une liste de menus valide.");
	}

	// Add menus
	const valuesPlaceholders = [];
	const values = [];

	menus.map(menu => {
		valuesPlaceholders.push("(?, ?)");
		values.push(order_id, menu.menu_id);
	});

	await db.query(`
		INSERT INTO orders_menus(order_id, menu_id)
		VALUES ${valuesPlaceholders.join(", ")}
		`, values
	);

	// Reduce stock
	return await Stock.reduce(db, menus);
};

/* ---- READ ------------------------------------ */
/**
 * @async
 * @function getAllByUserId
 * @description Get every menus of every orders of a user using its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} user_id - ID of the user
 * @returns {Promise<Array<*>|ModelError>} A list of all menus or a ModelError
 *
 * @example
 * 	OrderMenus.getAllOrdersByUserId(db, 4)
 */
const getAllByUserId = async (db, user_id) => {
	const menus = await db.query(`
  	SELECT
    	 orders.order_id,
       menus.menu_id,
       menus.name,
       mt.type_id,
       mt.name AS "type",
       menus.price,
       orders.is_finished
    FROM orders
		LEFT JOIN orders_menus om ON orders.order_id = om.order_id
		LEFT JOIN menus ON om.menu_id = menus.menu_id
		LEFT JOIN menu_types mt ON menus.type_id = mt.type_id
    WHERE orders.user_id = ?;
	`, [user_id]);

	return buildOrderMenus(db, menus);
};

/**
 * @async
 * @function getAllWaiting
 * @description Get every waiting menus (with count) and his order id
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<*>|ModelError>} A list of all menus or a ModelError
 *
 * @example
 * 	OrderMenus.getAllWaiting(db)
 */
const getAllWaiting = async (db) => {
	return await db.query(`
  	SELECT
			COUNT(orders_menus.menu_id) AS menu_count,
			orders_menus.menu_id,
			orders_menus.order_id,
			orders_menus.asking_time,
			menu_types.name AS type,
			menus.type_id
	FROM orders_menus, menus, menu_types
	WHERE orders_menus.is_waiting = TRUE
		AND menus.menu_id = orders_menus.menu_id
		AND menu_types.type_id = menus.type_id
	GROUP BY orders_menus.menu_id`);
};

/**
 * @async
 * @function getBookingMenusByUserId
 * @description Get every menus of every orders in the active bookings of a user using its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} user_id - ID of the user
 * @returns {Promise<Array<*>|ModelError>} A list of all menus or a ModelError
 *
 * @example
 * 	OrderMenus.getBookingMenusByUserId(db, 4)
 */
const getBookingMenusByUserId = async (db, user_id) => {
	const menus = await db.query(`
        SELECT
        	orders.order_id,
        	menus.menu_id,
          menus.name,
          mt.type_id,
          mt.name AS "type",
          menus.price,
          orders.is_finished
        FROM orders
        LEFT JOIN orders_menus om ON orders.order_id = om.order_id
        LEFT JOIN menus ON om.menu_id = menus.menu_id
        LEFT JOIN menu_types mt ON menus.type_id = mt.type_id
        INNER JOIN bookings bkgs ON orders.booking_id = bkgs.booking_id AND bkgs.is_paid = 0
        WHERE orders.user_id = ?;
	`, [user_id]);

	return buildOrderMenus(db, menus);
};

/**
 * @async
 * @function getBookingMenusByBookingId
 * @description Get every menus of every orders in the active bookings of a user using its booking ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} booking_id - ID of the booking
 * @returns {Promise<Array<*>|ModelError>} A list of all menus or a ModelError
 *
 * @example
 * 	OrderMenus.getBookingMenusByBookingId(db, 4)
 */
const getBookingMenusByBookingId = async (db, booking_id) => {
	const menus = await db.query(`
        SELECT
        	orders.order_id,
          menus.menu_id,
          menus.name,
          mt.type_id,
          mt.name AS "type",
          menus.price,
          orders.is_finished
        FROM orders
        LEFT JOIN orders_menus om ON orders.order_id = om.order_id
        LEFT JOIN menus ON om.menu_id = menus.menu_id
        LEFT JOIN menu_types mt ON menus.type_id = mt.type_id
        INNER JOIN bookings bkgs ON orders.booking_id = bkgs.booking_id AND bkgs.is_paid = 0
        WHERE orders.booking_id = ?;
	`, [booking_id]);

	return buildOrderMenus(db, menus);
};

/**
 * @async
 * @function getAllByOrderId
 * @description Get every menus of an order by the order id
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} order_id - ID of the order which contains a menu
 * @returns {Promise<Array<*>|ModelError>} A list of all menus or a ModelError
 *
 * @example
 * 	OrderMenus.getAllByOrderId(db, 4)
 */
const getAllByOrderId = async (db, order_id) => {
	const menus = await db.query(`
  	SELECT
			orders.order_id,
			menus.menu_id,
			menus.name,
			mt.type_id,
			mt.name AS "type",
			menus.price,
			orders.is_finished
    FROM orders
		LEFT JOIN orders_menus om ON orders.order_id = om.order_id
		LEFT JOIN menus ON om.menu_id = menus.menu_id
		LEFT JOIN menu_types mt ON menus.type_id = mt.type_id
    WHERE orders.order_id = ?;
	`, [order_id]);

	return buildOrderMenus(db, menus);
};

/**
 * @async
 * @function buildOrderMenus
 * @description Replace foreign keys by the corresponding data
 *
 * @param {Promise<void>} db - Database connection
 * @param {Array<Order>|Order} menus - One or multiple menus
 * @returns {Promise<Array<*>|*>} One or multiple full order menus
 *
 * @example
 * 	Order.buildOrderMenus(db, [<OrderMenu>, <OrderMenu>, ...])
 *Order.buildOrderMenus(db, <OrderMenu>)
 */
const buildOrderMenus = async (db, menus) => {
	const build = async menu => {
		return {
			order_id: menu.order_id,
			menu_id: menu.menu_id,
			name: menu.name,
			type: menu.type,
			type_id: menu.type_id,
			price: menu.price,
			is_finished: menu.is_finished
		};
	};

	if (Checkers.isArray(menus)) {
		const fullMenus = [];

		for (const menu of menus) {
			fullMenus.push(await build(menu));
		}

		return fullMenus;
	} else {
		return await build(menus);
	}
};

/*****************************************************
 * Export
 *****************************************************/

const OrderMenus = { addMultiple, getAllByUserId, getAllWaiting, getBookingMenusByUserId, getBookingMenusByBookingId, getAllByOrderId };
export default OrderMenus;