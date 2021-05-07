import { Router } from "express";
import middlewares from "../middlewares/index.js";
import User from "../models/User.js";
import ModelError from "../../global/ModelError.js";

// TODO: Set headers
const route = Router();

export default (router) => {
	router.use("/users", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/",
		middlewares.checkParams("email", "password1", "password2"),
		middlewares.database,
		async (request, response) => {
			const {email, password1, password2} = request.body;
			const db = await request.database;

			User.add(db, email, password1, password2)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({code: 202, message: "User created."}).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- READ ------------------------------------ */
	route.get(
		"/:email",
		middlewares.checkParams("email"),
		middlewares.database,
		async (request, response) => {
			const { email } = request.params;
			const db = await request.database;

			User.getByEmail(db, email)
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
};