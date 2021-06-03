import { Router } from "express";
import multer from "multer";
import mime from "mime";
import middlewares from "../middlewares/index.js";
import Menu from "../models/Menu.js";
import ModelError from "../../global/ModelError.js";

const route = Router();

const validMimeTypes = ["image/jpeg", "image/png", "image/bmp"];
const upload = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => cb(null, "./uploads/menu_images/"),
		filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}.${mime.getExtension(file.mimetype)}`)
	}),
	limits: { fileSize: 8000000 },
	fileFilter: async (req, file, cb) => {
		if (!validMimeTypes.includes(file.mimetype)) {
			cb(new Error("You must provide a jpeg, a png or a bmp image file."), false);
		}
		cb(null, true);
	},
}).single("illustration");

export default (router) => {
	router.use("/menus", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/",
		middlewares.checkParams("type"),
		middlewares.database,
		async (request, response) => {
			const { type, name, description, price } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Menu.add(db, type, name, description, price)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Menu added.", menu_id: result.menu_id }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.post(
		"/upload/illustration",
		middlewares.database,
		async (request, response) => {
			response.set("Content-Type", "application/json");

			upload(request, response, async function (err) {
				// File size error
				if (err instanceof multer.MulterError) {
					return response.status(400).json(new ModelError(400, "You must provide a file smaller than 8Mo.").json()).end();
				}
				// Invalid file type
				else if (err) {
					return response.status(500).json(new ModelError(500, err.message).json()).end();
				} else {
					const { menu_id } = request.body;
					const db = await request.database;

					Menu.setIllustration(db, menu_id, `/menu_images/${request.file.filename}`)
						.then(result => {
							if (result instanceof ModelError) {
								response.status(result.code()).json(result.json()).end();
							} else {
								response.status(200).json({ code: 200, message: "Illustration set." }).end();
							}
						})
						.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
						.finally(() => db ? db.release() : null);
				}
			});
		}
	);

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
			const { orderBy } = request.query;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Menu.getAll(db, orderBy)
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
		"/menusFromUserIdOrders/:user_id",
		middlewares.database,
		async (request, response) => {
			const { orderBy, user_id } = request.params;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Menu.getAllOrdersMenusByUserId(db, orderBy, user_id)
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
		"/",
		middlewares.database,
		async (request, response) => {
			const { menu_id, type_id, name, description, price } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Menu.update(db, menu_id, type_id, name, description, price)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Menu updated." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

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
		"/",
		middlewares.checkParams("menu_id"),
		middlewares.database,
		async (request, response) => {
			const { menu_id } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Menu.delete(db, menu_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Menu deleted." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

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