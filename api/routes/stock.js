import { Router } from "express";
import middlewares from "../middlewares/index.js";
import Stock from "../models/Stock.js";
import ModelError from "../../global/ModelError.js";

// TODO: Set headers
const route = Router();

export default (router) => {
	router.use("/stock", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/",
		middlewares.checkParams("name", "units", "unit_price", "is_orderable", "is_cookable"),
		middlewares.database,
		async (request, response) => {
			const {name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max} = request.body;
			const db = await request.database;

			Stock.addOrEdit(db, name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({code: 202, message: "Stock created."}).end();
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

			Stock.getAll(db)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, stocks: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/:name",
		middlewares.checkParams("name"),
		middlewares.database,
		async (request, response) => {
			const { name } = request.params;
			const db = await request.database;

			Stock.get(db, name)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json(result ? (result.length > 0 ? result[0] : result) : null).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- UPDATE ------------------------------------ */
	route.put(
		"/",
		middlewares.checkParams("stockId", "name", "units", "unit_price", "is_orderable", "is_cookable"),
		middlewares.database,
		async (request, response) => {
			const {stockId, name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max} = request.body;
			const db = await request.database;

			Stock.update(db, stockId, name, units, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({code: 202, message: "Stock updated."}).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- DELETE ------------------------------------ */
	route.delete(
		"/",
		middlewares.checkParams("stockId"),
		middlewares.database,
		async (request, response) => {
			const { stockId } = request.body;
			const db = await request.database;

			Stock.delete(db, stockId)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({code: 202, message: "Stock deleted."}).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);
};