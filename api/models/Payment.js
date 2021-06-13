/** @module models/Payment */
import ModelError from "../../global/ModelError.js";
import SalesStatistics from "./SalesStatistics.js";
import Booking from "./Booking.js";
import Order from "./Order.js";
import Table from "./Table.js";

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- UPDATE ---------------------------------- */
/**
 * @async
 * @function payTakeAway
 * @description Pay a take away order
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} user_id - The user who made this order
 * @param {string} [additional_infos] - Additional information provided by the user
 * @param {Array<Menu>} menus - The menus of this order
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Payment.payTakeAway(db, 7, null, [<Menu>, <Menu>, ...])
 */
const payTakeAway = async (db, user_id, additional_infos, menus) => {
	// Create the order
	const order = await Order.add(db, null, user_id, additional_infos, menus, true);

	if (order instanceof ModelError) {
		return new ModelError(400, `Erreur lors du paiement : ${order.message()}`);
	}

	const benefits = menus.reduce((previousValue, currentValue) => {
		return previousValue + currentValue.price;
	}, 0);

	// Update today stats
	const stats = await SalesStatistics.addBenefits(db, benefits);

	if (stats instanceof ModelError) {
		return new ModelError(400, `Erreur lors du paiement : ${stats.message()}`);
	}
};

/**
 * @async
 * @function payBooking
 * @description Pay a booking
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} booking_id - ID of the booking
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Payment.payBooking(db, 42)
 */
const payBooking = async (db, booking_id) => {
	// Get the booking
	const booking = await Booking.getById(db, booking_id);

	if (booking instanceof ModelError) {
		return new ModelError(400, `Erreur lors du paiement : ${booking.message()}`);
	}

	if (booking.is_finished) {
		return new ModelError(400, "Erreur lors du paiement : La réservation a déjà été payée.");
	}

	// Update the booking
	const bookingUpdate = await Booking.update(
		db, booking_id, null, null, null, false, false, true, true
	);

	if (bookingUpdate instanceof ModelError) {
		return new ModelError(400, `Erreur lors du paiement : ${bookingUpdate.message()}`);
	}

	// Free the table
	const tableUpdate = await Table.update(db, booking.table_id, null, null, true, null);

	if (tableUpdate instanceof ModelError) {
		return new ModelError(400, `Erreur lors du paiement : ${tableUpdate.message()}`);
	}

	const orders = await Order.getByBookingId(db, booking_id);
	const benefits = orders.reduce((previousValue, currentValue) => {
		return previousValue + currentValue.total_price;
	}, 0);

	// Update today stats
	const stats = await SalesStatistics.addBenefits(db, benefits);

	if (stats instanceof ModelError) {
		return new ModelError(400, `Erreur lors du paiement : ${stats.message()}`);
	}
};

/*****************************************************
 * Export
 *****************************************************/

const Payment = { payTakeAway, payBooking };
export default Payment;