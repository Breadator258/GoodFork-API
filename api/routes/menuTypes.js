import { Router } from "express";
import middlewares from "../middlewares/index.js";
import MenuTypes from "../models/MenuTypes.js";
import ModelError from "../../global/ModelError.js";

const route = Router();

export default (router) => {
	router.use("/menus/types/", route);

	/* ---- READ ------------------------------------ */
	route.get(
		"/all",
		middlewares.database,
		async (request, response) => {
			const db = await request.database;

			response.set("Content-Type", "application/json");

			MenuTypes.getAll(db)
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
};