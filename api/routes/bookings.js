import { Router } from "express";
import middlewares from "../middlewares/index.js";
import Booking from "../models/Booking.js";
import Table from "../models/Table.js";
import User from "../models/User.js";
import ModelError from "../../global/ModelError.js";

const route = Router();

export default (router) => {
	router.use("/bookings", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/",
		middlewares.checkParams("user_id", "table_id", "time", "clients_nb"),
		middlewares.database,
		async (request, response) => {
			const { user_id, table_id, time, clients_nb } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Booking.add(db, user_id, table_id, time, clients_nb)
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
		"/:booking_id",
		middlewares.checkParams("booking_id"),
		middlewares.database,
		async (request, response) => {
			const { booking_id } = request.params;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Booking.get(db, booking_id)
				.then(booking => {
					if (booking instanceof ModelError) {
						response.status(booking.code()).json(booking.json()).end();
					} else {
						Table.get(db, booking[0]['table_id'])
							.then(table => {
								if (table instanceof ModelError) {
									response.status(table.code()).json(table.json()).end();
								} else {
									User.getById(db, booking[0]['user_id'])
										.then(user => {
											if (user instanceof ModelError) {
												response.status(table.code()).json(table.json()).end();
											} else {
												response.status(200).json({
													code: 200,
													booking_id: booking[0]['booking_id'],
													user: {
														user_id: user[0]['user_id'],
														role: user[0]['role'],
														first_name: user[0]['first_name'],
														last_name: user[0]['last_name'],
														email: user[0]['email']
													},
													table: {
														table_id: table[0]['table_id'],
														name: table[0]['name'],
														capacity: table[0]['capacity']
													},
													time: booking[0]['time'],
													clients_nb: booking[0]['clients_nb']
												}).end();
											}
										})
										.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
										.finally(() => db ? db.release() : null);
								}
							})
							.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
							.finally(() => db ? db.release() : null);
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/userID/:user_id",
		middlewares.checkParams("user_id"),
		middlewares.database,
		async (request, response) => {
			const { user_id } = request.params;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Booking.getByUserId(db, user_id)
				.then(booking => {
					if (booking instanceof ModelError) {
						response.status(booking.code()).json(booking.json()).end();
					} else {
						Table.get(db, booking[0]['table_id'])
							.then(table => {
								if (table instanceof ModelError) {
									response.status(table.code()).json(table.json()).end();
								} else {
									User.getById(db, booking[0]['user_id'])
										.then(user => {
											if (user instanceof ModelError) {
												response.status(table.code()).json(table.json()).end();
											} else {
												response.status(200).json({
													code: 200,
													booking_id: booking[0]['booking_id'],
													user: {
														user_id: user[0]['user_id'],
														role: user[0]['role'],
														first_name: user[0]['first_name'],
														last_name: user[0]['last_name'],
														email: user[0]['email']
													},
													table: {
														table_id: table[0]['table_id'],
														name: table[0]['name'],
														capacity: table[0]['capacity']
													},
													time: booking[0]['time'],
													clients_nb: booking[0]['clients_nb']
												}).end();
											}
										})
										.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
										.finally(() => db ? db.release() : null);
								}
							})
							.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
							.finally(() => db ? db.release() : null);
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- UPDATE ------------------------------------ */
	// TODO: Need it ?

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