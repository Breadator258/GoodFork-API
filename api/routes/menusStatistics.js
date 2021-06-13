import { Router } from "express";
import middlewares from "../middlewares/index.js";
import MenusStatistics from "../models/MenusStatistics.js";
import ModelError from "../../global/ModelError.js";

const route = Router();

export default (router) => {
	router.use("/stats/menus", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/",
		middlewares.checkParams("menu_id", "count"),
		middlewares.database,
		async (request, response) => {
			const { menu_id, count } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			MenusStatistics.add(db, menu_id, count)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Menu ajouté." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- READ ------------------------------------ */
	route.get(
		"/today",
		middlewares.database,
		async (request, response) => {
			const db = await request.database;

			response.set("Content-Type", "application/json");

			MenusStatistics.getToday(db)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, stats: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/week",
		middlewares.database,
		async (request, response) => {
			const db = await request.database;

			response.set("Content-Type", "application/json");

			MenusStatistics.getWeek(db)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, stats: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);
};