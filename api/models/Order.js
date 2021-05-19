import { getFieldsToUpdate } from "../../global/Functions.js";
import Booking from "./Booking.js";
import User from "./User.js";
import ModelError from "../../global/ModelError.js";

/*****************************************************
 * Checkers
 *****************************************************/

const isAdditionalInfosValid = additional_infos => {
	if (!additional_infos) return true;
	else return `${additional_infos}`.length > 0 && `${additional_infos}`.length <= 1000;
};

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = async (db, booking_id, user_id, additional_infos, total_price, is_take_away, is_finished) => {
	if (!isAdditionalInfosValid(additional_infos)) {
		return new ModelError(400, "You must provide a valid additional infos text.", ["additional_infos"]);
	}

	// noinspection SqlInsertValues
	return db.query(`
	INSERT INTO orders(booking_id, user_id, additional_infos, total_price, is_take_away, is_finished)
	VALUES (?, ?, ?, ?, ? ,?)`, [booking_id, user_id, additional_infos ? additional_infos : null, total_price, is_take_away, is_finished]
	);
};

/* ---- READ ---------------------------------- */
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

	const fullOrder = await buildOrders(db, order);
	return fullOrder[0];
};

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

const buildOrders = async (db, orders) => {
	const fullOrders = [];

	for (const order of orders) {
		const user = await User.getById(db, order.user_id);
		let booking = await Booking.getById(db, order.booking_id);
		booking = booking instanceof ModelError ? null : {
			booking_id: booking[0].booking_id,
			user_id: booking[0].user.user_id,
			table_id: booking[0].table.table_id,
			time: booking[0].time,
			clients_nb: booking[0].clients_nb
		};

		fullOrders.push({
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
		});
	}

	return fullOrders;
};

/* ---- UPDATE ---------------------------------- */
const update = async (db, order_id, additional_infos, total_price, is_finished) => {
	if (!isAdditionalInfosValid(additional_infos)) {
		return new ModelError(400, "You must provide a valid additional infos text.", ["additional_infos"]);
	}

	const updatingFields = getFieldsToUpdate({ additional_infos, total_price, is_finished });
	if (!updatingFields) return new ModelError(200, "Nothing to update");

	return db.query(`UPDATE orders SET ${updatingFields} WHERE order_id = ?`, [order_id]);
};

/* ---- DELETE ---------------------------------- */
const del = async (db, order_id) => {
	return db.query("DELETE FROM orders WHERE order_id = ?", [order_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Order = { add, getById, getByUserId, getAll, update, delete: del };
export default Order;