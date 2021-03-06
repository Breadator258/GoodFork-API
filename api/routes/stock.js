import { Router } from "express";
import middlewares from "../middlewares/index.js";
import Stock from "../models/Stock.js";
import ModelError from "../../global/ModelError.js";

const route = Router();

export default (router) => {
	router.use("/stock", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/",
		middlewares.checkParams("name", "units", "unit_price", "is_orderable", "is_cookable"),
		middlewares.database,
		async (request, response) => {
			const { name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Stock.addOrEdit(db, name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Élément ajouté." }).end();
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

			response.set("Content-Type", "application/json");

			Stock.getByName(db, name)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, stock: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- UPDATE ------------------------------------ */
	route.put(
		"/",
		middlewares.checkParams("stock_id"),
		middlewares.database,
		async (request, response) => {
			const {
				stock_id, name, units, units_unit_id, unit_price, is_orderable,
				is_cookable, use_by_date_min, use_by_date_max
			} = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Stock.update(db, stock_id, name, units, units_unit_id, unit_price, is_orderable, is_cookable, use_by_date_min, use_by_date_max)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Élément mis à jour." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- DELETE ------------------------------------ */
	route.delete(
		"/",
		middlewares.checkParams("stock_id"),
		middlewares.database,
		async (request, response) => {
			const { stock_id } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Stock.delete(db, stock_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Élément supprimé." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);
};