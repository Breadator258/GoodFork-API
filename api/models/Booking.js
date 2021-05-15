import { getFieldsToUpdate, convertDate } from "../../global/Functions.js";
import ModelError from "../../global/ModelError.js";

/*****************************************************
 * Checkers
 *****************************************************/

const isClientsNbValid = clients_nb => {
	return clients_nb >= 1;
};

const isDateValid = d => {
	const convertedDate = convertDate(d);
	return !isNaN(convertedDate) && convertedDate !== null && convertedDate !== undefined;
};

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = async (db, user_id, table_id, time, clients_nb) => {

	if (!isClientsNbValid(clients_nb)) {
		return new ModelError(400, "You must provide a valid clients number.", ["clients_nb"]);
	}

	if (!isDateValid(time)) {
		return new ModelError(400, "You must provide a valid booking date.", ["time"]);
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
const get = async (db, booking_id) => {
	const booking = await db.query(`
		SELECT *  
		FROM bookings
		WHERE booking_id = ?
	`, [booking_id]);

	return booking;
};

const getByUserId = async (db, user_id) => {
	const booking = await db.query(`
		SELECT *  
		FROM bookings
		WHERE user_id = ?
	`, [user_id]);

	return booking;
};

const getAll = async db => {
	return db.query(`
		SELECT *
		FROM bookings
		ORDER BY bookings.booking_id
	`);
};

const bookingExist = async (db, table_id) => {
	return db.query("SELECT * FROM bookings WHERE table_id = ?", [table_id]);
};

/* ---- UPDATE ---------------------------------- */
// TODO: Need it ?

/* ---- DELETE ---------------------------------- */
const del = async (db, booking_id) => {
	return db.query("DELETE FROM bookings WHERE booking_id = ?", [booking_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const Booking = { add, get, getByUserId, getAll, delete: del };
export default Booking;