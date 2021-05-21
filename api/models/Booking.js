import Table from "./Table.js";
import User from "./User.js";
import ModelError from "../../global/ModelError.js";
import Checkers from "../../global/Checkers.js";

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = async (db, user_id, table_id, time, clients_nb) => {
	if (!Checkers.isDate(time)) {
		return new ModelError(400, "You must provide a valid booking date.", ["time"]);
	}

	if (!Checkers.isGreaterThan(clients_nb, 1, true)) {
		return new ModelError(400, "You must provide a valid number of clients.", ["clients_nb"]);
	}

	const checkBooking = await bookingExist(db, table_id);

	if (checkBooking.length !== 0) {
		return new ModelError(400, "This table is already booked. Please pick another table.", ["time"]);
	} else {
		return db.query(`
		INSERT INTO bookings(user_id, table_id, time, clients_nb)
		VALUES (?, ?, ?, ?)
		`, [user_id, table_id, time, clients_nb]
		);
	}
};

/* ---- READ ---------------------------------- */
const getById = async (db, booking_id) => {
	const booking = await db.query(`
		SELECT
			booking_id,
			user_id,
			table_id,
			time,
			clients_nb
		FROM bookings
		WHERE booking_id = ?
	`, [booking_id]);

	return booking[0]
		? buildBookings(db, [booking[0]])
		: new ModelError(404, "No booking found with this id.");
};

const getByUserId = async (db, user_id) => {
	const booking = await db.query(`
		SELECT
			booking_id,
			user_id,
			table_id,
			time,
			clients_nb
		FROM bookings
		WHERE user_id = ?
	`, [user_id]);

	return booking[0]
		? buildBookings(db, [booking[0]])
		: new ModelError(404, "No booking found with this user id.");
};

const getAll = async db => {
	const bookings = await db.query(`
		SELECT
			booking_id,
			user_id,
			table_id,
			time,
			clients_nb
		FROM bookings
		ORDER BY booking_id
	`);

	return buildBookings(db, bookings);
};

const bookingExist = async (db, table_id) => {
	return db.query("SELECT booking_id FROM bookings WHERE table_id = ?", [table_id]);
};

const buildBookings = async (db, bookings) => {
	const fullBookings = [];

	for (const booking of bookings) {
		const user = await User.getById(db, booking.user_id);
		const table = await Table.getById(db, booking.table_id);

		fullBookings.push({
			booking_id: booking.booking_id,
			user: {
				user_id: user.user_id,
				role: user.role,
				first_name: user.first_name,
				last_name: user.last_name,
				email: user.email
			},
			table: {
				table_id: table.table_id,
				name: table.name,
				capacity: table.capacity
			},
			time: booking.time,
			clients_nb: booking.clients_nb
		});
	}

	return fullBookings;
};

/* ---- DELETE ---------------------------------- */
const del = async (db, booking_id) => {
	return db.query("DELETE FROM bookings WHERE booking_id = ?", [booking_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Booking = { add, getById, getByUserId, getAll, delete: del };
export default Booking;