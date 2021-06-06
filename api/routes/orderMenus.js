import { Router } from "express";
import middlewares from "../middlewares/index.js";
import OrderMenus from "../models/OrderMenus.js";
import ModelError from "../../global/ModelError.js";

const route = Router();

export default (router) => {
	router.use("/orders/menus", route);

	/* ---- READ ------------------------------------ */
	route.get(
		"/user_id/:user_id",
		middlewares.database,
		async (request, response) => {
			const { user_id } = request.params;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			OrderMenus.getAllByUserId(db, user_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, menus: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/order_id/:order_id",
		middlewares.database,
		async (request, response) => {
			const { order_id } = request.params;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			OrderMenus.getAllByOrderId(db, order_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, menus: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);
};