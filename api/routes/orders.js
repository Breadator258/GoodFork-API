import { Router } from "express";
import middlewares from "../middlewares/index.js";
import Order from "../models/Order.js";
import ModelError from "../../global/ModelError.js";

const route = Router();

export default (router) => {
	router.use("/orders", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/",
		middlewares.checkParams("user_id", "menus", "is_take_away"),
		middlewares.database,
		async (request, response) => {
			const { booking_id, user_id, additional_infos, menus, is_take_away } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Order.add(db, booking_id, user_id, additional_infos, menus, is_take_away)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Order created." }).end();
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

			Order.getAll(db)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, orders: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/allNotFinished",
		middlewares.database,
		async (request, response) => {
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Order.getAllNotFinished(db)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, orders: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/:order_id",
		middlewares.checkParams("order_id"),
		middlewares.database,
		async (request, response) => {
			const { order_id } = request.params;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Order.getById(db, order_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, order: result }).end();
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

			Order.getByUserId(db, user_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, orders: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- UPDATE ------------------------------------ */
	route.put(
		"/",
		middlewares.checkParams("order_id"),
		middlewares.database,
		async (request, response) => {
			const { order_id, additional_infos, total_price, is_finished } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Order.update(db, order_id, additional_infos, total_price, is_finished)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Order updated." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- DELETE ------------------------------------ */
	route.delete(
		"/",
		middlewares.checkParams("order_id"),
		middlewares.database,
		async (request, response) => {
			const { order_id } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Order.delete(db, order_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Order deleted." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);
};