import { Router } from "express";
import middlewares from "../middlewares/index.js";
import Measurement from "../models/Measurement.js";
import MeasurementUnit from "../models/MeasurementUnit.js";
import MeasurementType from "../models/MeasurementType.js";
import ModelError from "../../global/ModelError.js";

const route = Router();

export default (router) => {
	router.use("/measurement", route);

	/* ---- READ ------------------------------------ */
	route.get(
		"/all",
		middlewares.database,
		async (request, response) => {
			const { ordered, forStock } = request.query;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			(ordered === "true"
				? Measurement.getAllByTypes(db, forStock === "true")
				: Measurement.getAll(db, forStock === "true")
			).then(result => {
				if (result instanceof ModelError) {
					response.status(result.code()).json(result.json()).end();
				} else {
					response.status(200).json({ code: 200, measurements: result }).end();
				}
			})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/:name",
		middlewares.database,
		async (request, response) => {
			const { name } = request.params;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Measurement.getByName(db, name)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, measurement: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/units/:unit_id",
		middlewares.database,
		async (request, response) => {
			const { unit_id } = request.params;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			MeasurementUnit.getById(db, unit_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, unit: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/types/all",
		middlewares.database,
		async (request, response) => {
			const db = await request.database;

			response.set("Content-Type", "application/json");

			MeasurementType.getAll(db)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, types: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.post(
		"/convert",
		middlewares.checkParams("value", "from", "to"),
		middlewares.database,
		async (request, response) => {
			const { value, from, to } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Measurement.convert(db, value, from, to)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json({ code: 200, conversion: result }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);
};