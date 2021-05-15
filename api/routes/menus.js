import { Router } from "express";
import middlewares from "../middlewares/index.js";
import Menu from "../models/Menu.js";
import ModelError from "../../global/ModelError.js";

const route = Router();

export default (router) => {
	router.use("/menus", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/ingredients",
		middlewares.checkParams("menu_id", "name", "units", "units_unit_id"),
		middlewares.database,
		async (request, response) => {
			const { menu_id, name, units, units_unit_id } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Menu.addIngredient(db, menu_id, name, units, units_unit_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Ingredient added to the menu." }).end();
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

	/* ---- UPDATE ------------------------------------ */
	route.put(
		"/ingredients",
		middlewares.checkParams("ingredient_id"),
		middlewares.database,
		async (request, response) => {
			const { ingredient_id, name, units, units_unit_id } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Menu.updateIngredient(db, ingredient_id, name, units, units_unit_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Ingredient updated." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- DELETE ------------------------------------ */
	route.delete(
		"/ingredients",
		middlewares.checkParams("ingredient_id"),
		middlewares.database,
		async (request, response) => {
			const { ingredient_id } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Menu.deleteIngredient(db, ingredient_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Ingredient removed from the menu." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);
};