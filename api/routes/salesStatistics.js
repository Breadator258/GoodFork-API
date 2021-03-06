import { Router } from "express";
import middlewares from "../middlewares/index.js";
import SalesStatistics from "../models/SalesStatistics.js";
import ModelError from "../../global/ModelError.js";

const route = Router();

export default (router) => {
	router.use("/stats/sales", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/benefits",
		middlewares.checkParams("benefits"),
		middlewares.database,
		async (request, response) => {
			const { benefits } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			SalesStatistics.addBenefits(db, benefits)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Bénéfices ajouté à ceux du jour." }).end();
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

			SalesStatistics.getToday(db)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, stat: result }).end();
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

			SalesStatistics.getWeek(db)
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