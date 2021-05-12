import { Router } from "express";
import middlewares from "../middlewares/index.js";
import User from "../models/User.js";
import Token from "../models/Token.js";
import ModelError from "../../global/ModelError.js";

// TODO: Set headers
const route = Router();

export default (router) => {
	router.use("/users", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/staff",
		middlewares.checkParams("role_id", "first_name", "email"),
		middlewares.toLowercase("email"),
		middlewares.database,
		async (request, response) => {
			const { role_id, first_name, last_name } = request.body;
			const { email } = request.lowerCasedParams;
			const db = await request.database;

			User.addStaff(db, first_name, last_name, email, role_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(result.code).json(result).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.post(
		"/",
		middlewares.checkParams("first_name", "email", "password1", "password2"),
		middlewares.toLowercase("email"),
		middlewares.database,
		async (request, response) => {
			const { first_name, last_name, password1, password2 } = request.body;
			const { email } = request.lowerCasedParams;
			const db = await request.database;

			User.add(db, first_name, last_name, email, password1, password2)
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
	route.post(
		"/login",
		middlewares.checkParams("email", "password"),
		middlewares.toLowercase("email"),
		middlewares.database,
		async (request, response) => {
			const { password } = request.body;
			const { email } = request.lowerCasedParams;
			const db = await request.database;

			try {
				const user = await User.login(db, email, password);

				if (user instanceof ModelError) {
					response.status(user.code()).json(user.json()).end();
				} else {
					const token = await Token.getNew(db, user.user_id);

					response.status(200).json({ user: user, token: token }).end();
				}

			} catch (err) {
				response.status(500).json(new ModelError(500, err.message).json()).end();
			}
		}
	);
	
	route.get(
		"/staff/all",
		middlewares.database,
		async (request, response) => {
			const db = await request.database;

			User.getStaff(db)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(200).json(result).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.get(
		"/:email",
		middlewares.checkParams("email"),
		middlewares.toLowercase("email"),
		middlewares.database,
		async (request, response) => {
			const { email } = request.lowerCasedParams;
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

	/* ---- UPDATE ---------------------------------- */
	route.put(
		"/",
		middlewares.checkParams("user_id"),
		middlewares.toLowercase("email"),
		middlewares.database,
		async (request, response) => {
			const { user_id, role_id, first_name, last_name } = request.body;
			const { email } = request.lowerCasedParams;
			const db = await request.database;

			User.update(db, user_id, role_id, first_name, last_name, email)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({code: 202, message: "User updated."}).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	/* ---- DELETE ---------------------------------- */
	route.delete(
		"/staff",
		middlewares.checkParams("user_id"),
		middlewares.database,
		async (request, response) => {
			const { user_id } = request.body;
			const db = await request.database;

			User.deleteStaff(db, user_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Staff deleted." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);
};