/** @module models/Booking */
import Table from "./Table.js";
import User from "./User.js";
import ModelError from "../../global/ModelError.js";
import Checkers from "../../global/Checkers.js";
import { getFieldsToUpdate } from "../../global/Functions.js";

/**
 * A booking
 * @typedef {Object} Booking
 * @property {Number} booking_id - ID of the booking
 * @property {Number} user_id - ID of the user who made the booking
 * @property {Number} table_id - ID of the table reserved for this booking
 * @property {string|Date} time - When the booking is scheduled
 * @property {Number} clients_nb - How many clients will be present
 * @property {Boolean|Number} is_client_on_place - Is the client on place or not
 * @property {Boolean|Number} can_client_pay - Is the client able to access payment page or not
 * @property {Boolean|Number} is_finished - Is the booking ended or not
 * @property {Boolean|Number} is_paid - Is the booking paid
 */

/**
 * A full booking
 * @typedef {Object} FullBooking
 * @property {Number} booking_id - ID of the booking
 * @property {User} user - User who made the booking
 * @property {Table} table - The table reserved for this booking
 * @property {string|Date} time - When the booking is scheduled
 * @property {Number} clients_nb - How many clients will be present
 * @property {Boolean|Number} is_client_on_place - Is the client on place or not
 * @property {Boolean|Number} can_client_pay - Is the client able to access payment page or not
 * @property {Boolean|Number} is_finished - Is the booking ended or not
 * @property {Boolean|Number} is_paid - Is the booking paid
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
/**
 * @async
 * @function add
 * @description Add a booking
 *
 * @param {Promise<void>} db - Database connection
 * @param {string|Number} user_id - ID of the user who made the booking
 * @param {string} time - When the booking is scheduled
 * @param {Number} clients_nb - How many clients will be present
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Booking.add(db, 1, "2021-06-03 15:10:00", 3)
 */
const add = async (db, user_id, time, clients_nb) => {
	const bookingTime = new Date(time);

	if (!Checkers.isDate(bookingTime)) {
		return new ModelError(400, "Vous devez fournir une date de réservation valide.", ["time"]);
	}

	if (!Checkers.isGreaterThan(clients_nb, 0)) {
		return new ModelError(400, "Vous devez fournir un nombre valide de personnes.", ["clients_nb"]);
	}

	const availableTable = await Table.getByTableCapacity(db, clients_nb);

	if (availableTable instanceof ModelError) {
		return new ModelError(400, "Aucune table n'est disponible à cette date.", ["time"]);
	} else {
		await Table.update(db, availableTable.table_id, null, null ,false);

		return db.query(`
			INSERT INTO bookings(user_id, table_id, time, clients_nb)
			VALUES (?, ?, ?, ?)
		`, [user_id, availableTable.table_id, time, clients_nb]
		);
	}
};

/* ---- READ ---------------------------------- */
/**
 * @async
 * @function getById
 * @description Get a booking by its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {string|Number} booking_id - ID of the wanted booking
 * @returns {Promise<Booking|ModelError>} A booking or a ModelError
 *
 * @example
 * 	Booking.getById(db, 4)
 */
const getById = async (db, booking_id) => {
	const booking = await db.query(`
		SELECT
			booking_id,
			user_id,
			table_id,
			time,
			clients_nb,
			is_client_on_place,
			can_client_pay,
		  is_finished,
		  is_paid
		FROM bookings
		WHERE booking_id = ?
	`, [booking_id]);

	return booking[0]
		? buildBookings(db, booking[0])
		: new ModelError(404, `Aucune réservation n'a été trouvée avec l'ID "${booking_id}".`);
};

/**
 * @async
 * @function getByUserId
 * @description Get a booking by its associated user's ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {string|Number} user_id - ID of the user who made the booking
 * @returns {Promise<Array<Booking>|ModelError>} A list of bookings or a ModelError
 *
 * @example
 * 	Booking.getByUserId(db, 1)
 */
const getByUserId = async (db, user_id) => {
	const bookings = await db.query(`
		SELECT
			booking_id,
			user_id,
			table_id,
			time,
			clients_nb,
			is_client_on_place,
			can_client_pay,
		  is_finished,
		  is_paid
		FROM bookings
		WHERE user_id = ?
	`, [user_id]);

	return bookings[0]
		? buildBookings(db, bookings)
		: new ModelError(404, `Aucune réservation n'a été trouvée avec l'ID utilisateur "${user_id}".`);
};

/**
 * @async
 * @function getActiveByUserId
 * @description Get the current active booking of a user by its associated user's ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {string|Number} user_id - ID of the user who made the booking
 * @returns {Promise<Booking|ModelError>} A bookings or a ModelError
 *
 * @example
 * 	Booking.getActiveByUserId(db, 1)
 */
const getActiveByUserId = async (db, user_id) => {
	const booking = await db.query(`
		SELECT
			booking_id,
			user_id,
			table_id,
			time,
			clients_nb,
			is_client_on_place,
			can_client_pay,
			is_finished,
			is_paid
		FROM bookings
		WHERE user_id = ? AND is_client_on_place = 1 AND is_finished = 0
	`, [user_id]);

	return booking[0]
		? buildBookings(db, booking)
		: new ModelError(404, `Aucune réservation n'a été trouvée avec l'ID utilisateur "${user_id}".`);
};

/**
 * @async
 * @function getAll
 * @description Get all bookings of all users
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<Booking>>} A list of bookings
 *
 * @example
 * 	Booking.getAll(db)
 */
const getAll = async db => {
	const bookings = await db.query(`
		SELECT
			booking_id,
			user_id,
			table_id,
			time,
			clients_nb,
			is_client_on_place,
			can_client_pay,
		  is_finished,
		  is_paid
		FROM bookings
		ORDER BY booking_id
	`);

	return buildBookings(db, bookings);
};

/**
 * @async
 * @function getAllActive
 * @description Get all active bookings
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<Booking>>} A list of bookings
 *
 * @example
 * 	Booking.getAll(db)
 */
const getAllActive = async db => {
	const bookings = await db.query(`
		SELECT
			booking_id,
			user_id,
			table_id,
			time,
			clients_nb,
			is_client_on_place,
			can_client_pay,
		  is_finished,
		  is_paid
		FROM bookings
		WHERE is_paid = 0
		AND is_client_on_place = 1
		ORDER BY booking_id
	`);

	return buildBookings(db, bookings);
};

/**
 * @async
 * @function getAllToday
 * @description Get all bookings of the day
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<Booking>>} A list of bookings
 *
 * @example
 * 	Booking.getAllToday(db)
 */
const getAllToday = async db => {
	const bookings = await db.query(`
  	SELECT booking_id,
		user_id,
		table_id,
		time,
		clients_nb,
		is_client_on_place,
		can_client_pay,
		is_finished,
		is_paid
    FROM bookings
    WHERE
    	time >= timestamp(CURRENT_DATE)
      AND time < ADDDATE(timestamp(CURRENT_DATE), 1)
		ORDER BY booking_id
	`);

	return buildBookings(db, bookings);
};

/**
 * @async
 * @function buildBookings
 * @description Replace foreign keys by the corresponding data
 *
 * @param {Promise<void>} db - Database connection
 * @param {Array<Booking>|Booking} bookings - One or multiple bookings
 * @returns {Promise<Array<FullBooking>|FullBooking>} One or multiple full bookings
 *
 * @example
 * 	Booking.buildBookings(db, [{booking_id: 4, user_id: 1, table_id: 7, time: "2021-06-03 15:10:00", 3}, ...])
 *Booking.buildBookings(db, {booking_id: 4, user_id: 1, table_id: 7, time: "2021-06-03 15:10:00", 3})
 */
const buildBookings = async (db, bookings) => {
	const build = async booking => {
		const user = await User.getById(db, booking.user_id);
		const table = await Table.getById(db, booking.table_id);

		return {
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
			clients_nb: booking.clients_nb,
			is_client_on_place: booking.is_client_on_place,
			can_client_pay: booking.can_client_pay,
			is_finished: booking.is_finished
		};
	};

	if (Checkers.isArray(bookings)) {
		const fullBookings = [];

		for (const booking of bookings) {
			fullBookings.push(await build(booking));
		}

		return fullBookings;
	} else {
		return await build(bookings);
	}
};

/* ---- UPDATE ---------------------------------- */
/**
 * @async
 * @function update
 * @description Update the booking
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} booking_id - ID of the booking
 * @param {Number|string} table_id - ID of the table reserved for this booking
 * @param {string|Date} time - When the booking is scheduled
 * @param {Number} clients_nb - How many clients will be present
 * @param {Number|boolean} is_client_on_place - Is the client on place or not
 * @param {Boolean|Number} can_client_pay - Is the client able to access payment page or not
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Booking.update(db, 20, 1, null, 3, false, true)
 */
const update = async (db, booking_id, table_id, time, clients_nb, is_client_on_place, can_client_pay, is_finished, is_paid) => {
	const updatingFields = getFieldsToUpdate({ table_id, time, clients_nb, is_client_on_place, can_client_pay, is_finished, is_paid });
	if (!updatingFields) return new ModelError(200, "Rien à mettre à jour.");

	return db.query(`UPDATE bookings SET ${updatingFields} WHERE booking_id = ?`, [booking_id]);
};

/* ---- DELETE ---------------------------------- */
/**
 * @async
 * @function delete
 * @description Delete a booking by its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {string|Number} booking_id - ID of the booking
 * @returns {Promise<void>} Nothing
 *
 * @example
 * 	Booking.delete(db, 4)
 */
const del = async (db, booking_id) => {
	const booking = await getById(db, booking_id);
	await Table.update(db, booking[0].table.table_id, null, null ,true);

	return db.query("DELETE FROM bookings WHERE booking_id = ?", [booking_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Booking = { add, getById, getByUserId, getActiveByUserId, getAll, getAllActive, getAllToday, update, delete: del };
export default Booking;