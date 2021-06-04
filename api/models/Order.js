/** @module models/Order */
import { getFieldsToUpdate } from "../../global/Functions.js";
import Booking from "./Booking.js";
import OrderMenus from "./OrderMenus.js";
import User from "./User.js";
import ModelError from "../../global/ModelError.js";
import Checkers from "../../global/Checkers.js";

/**
 * An Order
 * @typedef {Object} Order
 * @property {Number} order_id - ID of the order
 * @property {Number} [booking_id] - ID of the booking associated with this order
 * @property {Number} user_id - The user ID who made this order
 * @property {string} [additional_infos] - Additional information provided by the user
 * @property {Date|string} time - Time the order was added
 * @property {Number} total_price - Total price of this order
 * @property {Boolean} is_take_away - Is take away
 * @property {Boolean} is_finished - Does the waiter give this order
 */

/**
 * A Full order
 * @typedef {Object} FullOrder
 * @property {Number} order_id - ID of the order
 * @property {Booking} booking - The booking associated with this order
 * @property {User} user - The user who made this order
 * @property {string} [additional_infos] - Additional information provided by the user
 * @property {Date|string} time - Time the order was added
 * @property {Number} total_price - Total price of this order
 * @property {Boolean} is_take_away - Is take away
 * @property {Boolean} is_finished - Does the waiter give this order
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
/**
 * @function add
 * @async
 * @description Add an order
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} [booking_id] - ID of the booking associated with this order
 * @param {Number|string} user_id - The user who made this order
 * @param {string} [additional_infos] - Additional information provided by the user
 * @param {Array<Menu>} menus - The menus of this order
 * @param {Boolean} is_take_away - Is take away
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Order.add(db, 94, 7, null, [<Menu>, <Menu>, ...], false)
 */
const add = async (db, booking_id, user_id, additional_infos, menus, is_take_away) => {
	if (!Checkers.strInRange(additional_infos, null, 1000, true, true)) {
		return new ModelError(400, "You must provide a valid additional infos text.", ["additional_infos"]);
	}

	// Check the user
	const user = await User.getById(db, user_id);

	if (!user) {
		return new ModelError(400, "The given user id is not a user");
	}

	// Get the price
	let price = 0;
	menus.map(menu => price += menu.price);

	// Add the order
	const order = await db.query(`
		INSERT INTO orders(booking_id, user_id, additional_infos, total_price, is_take_away, is_finished)
		VALUES (?, ?, ?, ?, ? ,?)`, [booking_id ? booking_id : null, user_id, additional_infos ? additional_infos : null, price, is_take_away, false]
	);
	const orderId = order.insertId;

	return OrderMenus.addMultiple(db, orderId, menus);
};

/* ---- READ ---------------------------------- */
/**
 * @function getById
 * @async
 * @description Get an order by its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} order_id - ID of the order
 * @returns {Promise<FullOrder|ModelError>} A full order or a ModelError
 *
 * @example
 * 	Order.getById(db, 30)
 */
const getById = async (db, order_id) => {
	const order = await db.query(`
		SELECT
			order_id,
			booking_id,
			user_id,
      additional_infos,
			time,
			total_price,
			is_take_away,
			is_finished
		FROM orders
		WHERE order_id = ?
	`, [order_id]);

	if (!order[0]) {
		return new ModelError(404, "No order found with this id.");
	}

	return await buildOrders(db, order[0]);
};

/**
 * @function getByUserId
 * @async
 * @description Get an order by its associated user's ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} user_id - ID of the user
 * @returns {Promise<Array<FullOrder>|ModelError>} A list of full orders or a ModelError
 *
 * @example
 * 	Order.getByUserId(db, 4)
 */
const getByUserId = async (db, user_id) => {
	const orders = await db.query(`
		SELECT
  		order_id,
  		booking_id,
    	user_id,
    	additional_infos,
    	time,
    	total_price,
    	is_take_away,
    	is_finished
		FROM orders
		WHERE user_id = ?
	`, [user_id]);

	return buildOrders(db, orders);
};

/**
 * @function getAll
 * @async
 * @description Get an order by its associated user's ID
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<FullOrder>>} A list of full orders
 *
 * @example
 * 	Order.getAll(db)
 */
const getAll = async db => {
	const orders = await db.query(`
		SELECT
		order_id,
    booking_id,
    user_id,
    additional_infos,
    time,
   	total_price,
    is_take_away,
    is_finished
		FROM orders
		ORDER BY order_id
	`);

	return buildOrders(db, orders);
};

/**
 * @function buildOrders
 * @async
 * @description Replace foreign keys by the corresponding data
 *
 * @param {Promise<void>} db - Database connection
 * @param {Array<Order>|Order} orders - One or multiple orders
 * @returns {Promise<Array<FullOrder>|FullOrder>} One or multiple full orders
 *
 * @example
 * 	Order.buildOrders(db, [<Order>, <Order>, ...])
 *Order.buildOrders(db, <Order>)
 */
const buildOrders = async (db, orders) => {
	const build = async order => {
		const user = await User.getById(db, order.user_id);
		let booking = await Booking.getById(db, order.booking_id);
		booking = booking instanceof ModelError ? null : {
			booking_id: booking.booking_id,
			user_id: booking.user.user_id,
			table_id: booking.table.table_id,
			time: booking.time,
			clients_nb: booking.clients_nb
		};

		return {
			order_id: order.order_id,
			user: {
				user_id: user.user_id,
				role: user.role,
				first_name: user.first_name,
				last_name: user.last_name,
				email: user.email
			},
			booking: booking,
			additional_infos: order.additional_infos,
			total_price: order.total_price,
			is_take_away: order.is_take_away,
			is_finished: order.is_finished,
			time: order.time
		};
	};

	if (Checkers.isArray(orders)) {
		const fullOrders = [];

		for (const order of orders) {
			fullOrders.push(await build(order));
		}

		return fullOrders;
	} else {
		return await build(orders);
	}
};

/* ---- UPDATE ---------------------------------- */
/**
 * @function update
 * @async
 * @description Update an order using its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} order_id - ID of the order
 * @param {string} [additional_infos] - Additional information provided by the user
 * @param {Number} [total_price] - Total price of this order
 * @param {Boolean} [is_finished] - Does the waiter give this order
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Order.update(db, 41, "J'aime pas la salade", null, null, null)
 */
const update = async (db, order_id, additional_infos, total_price, is_finished) => {
	if (!Checkers.strInRange(additional_infos, null, 1000, true, true)) {
		return new ModelError(400, "You must provide a valid additional infos text.", ["additional_infos"]);
	}

	const updatingFields = getFieldsToUpdate({ additional_infos, total_price, is_finished });
	if (!updatingFields) return new ModelError(200, "Nothing to update");

	return db.query(`UPDATE orders SET ${updatingFields} WHERE order_id = ?`, [order_id]);
};

/* ---- DELETE ---------------------------------- */
/**
 * @function delete
 * @async
 * @description Delete an order using its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} order_id - ID of the order
 * @returns {Promise<void>}
 *
 * @example
 * 	Order.delete(db, 41)
 */
const del = async (db, order_id) => {
	return db.query("DELETE FROM orders WHERE order_id = ?", [order_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Order = { add, getById, getByUserId, getAll, update, delete: del };
export default Order;