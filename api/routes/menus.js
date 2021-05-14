import { Router } from "express";
import middlewares from "../middlewares/index.js";
import Menu from "../models/Menu.js";
import ModelError from "../../global/ModelError.js";

const route = Router();

export default (router) => {
	router.use("/menus", route);

	/* ---- READ ------------------------------------ */
	route.get(
		"/all",
		middlewares.database,
		async (request, response) => {
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Menu.getAll(db)
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
		"/:menu_id",
		middlewares.database,
		async (request, response) => {
			const { menu_id } = request.params;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Menu.getById(db, menu_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, menu: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);
};