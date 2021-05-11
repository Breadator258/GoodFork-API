import { Router } from "express";
import middlewares from "../middlewares/index.js";
import Table from "../models/Table.js";
import ModelError from "../../global/ModelError.js";

// TODO: Set headers
const route = Router();

export default (router) => {
	router.use("/tables", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/",
		middlewares.checkParams("capacity"),
		middlewares.database,
		async (request, response) => {
			const { name, capacity, is_available } = request.body;
			const db = await request.database;

			Table.add(db, name, capacity, is_available)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({code: 202, message: "Table created."}).end();
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

			Table.getAll(db)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, tables: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- UPDATE ------------------------------------ */
	route.put(
		"/",
		middlewares.checkParams("table_id"),
		middlewares.database,
		async (request, response) => {
			const { table_id, name, capacity, is_available } = request.body;
			const db = await request.database;

			Table.update(db, table_id, name, capacity, is_available)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({code: 202, message: "Table updated."}).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- DELETE ------------------------------------ */
	route.delete(
		"/",
		middlewares.checkParams("table_id"),
		middlewares.database,
		async (request, response) => {
			const { table_id } = request.body;
			const db = await request.database;

			Table.delete(db, table_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({code: 202, message: "Table deleted."}).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);
};