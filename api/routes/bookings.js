import { Router } from "express";
import middlewares from "../middlewares/index.js";
import Booking from "../models/Booking.js";
import ModelError from "../../global/ModelError.js";

const route = Router();

export default (router) => {
	router.use("/bookings", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/",
		middlewares.checkParams("user_id", "time", "clients_nb"),
		middlewares.database,
		async (request, response) => {
			const { user_id, time, clients_nb } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Booking.add(db, user_id, time, clients_nb)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Booking created." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- READ ------------------------------------ */
	route.get(
		"/all",
		middlewares.database,
		async (request, response) => {
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Booking.getAll(db)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, bookings: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/today/all",
		middlewares.database,
		async (request, response) => {
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Booking.getAllToday(db)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, bookings: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/:booking_id",
		middlewares.checkParams("booking_id"),
		middlewares.database,
		async (request, response) => {
			const { booking_id } = request.params;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Booking.getById(db, booking_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, booking: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/user_id/:user_id",
		middlewares.checkParams("user_id"),
		middlewares.database,
		async (request, response) => {
			const { user_id } = request.params;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Booking.getByUserId(db, user_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, bookings: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/user_id/active/:user_id",
		middlewares.checkParams("user_id"),
		middlewares.database,
		async (request, response) => {
			const { user_id } = request.params;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Booking.getActiveByUserId(db, user_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, booking: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- UPDATE ------------------------------------ */
	route.put(
		"/",
		middlewares.checkParams("booking_id"),
		middlewares.database,
		async (request, response) => {
			const {
				booking_id, table_id, time, clients_nb, is_client_on_place, can_client_pay, is_finished, is_paid
			} = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Booking.update(db, booking_id, table_id, time, clients_nb, is_client_on_place, can_client_pay, is_finished, is_paid)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Booking updated." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- DELETE ------------------------------------ */
	route.delete(
		"/",
		middlewares.checkParams("booking_id"),
		middlewares.database,
		async (request, response) => {
			const { booking_id } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Booking.delete(db, booking_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Booking deleted." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);
};