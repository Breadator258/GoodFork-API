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
		"/staff",
		middlewares.checkParams("firstName", "email", "role"),
		middlewares.database,
		async (request, response) => {
			const { firstName, lastName, email, role } = request.body;
			const db = await request.database;

			User.addStaff(db, firstName, lastName, email, role)
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
		middlewares.checkParams("firstName", "email", "password1", "password2"),
		middlewares.database,
		async (request, response) => {
			const { firstName, lastName, email, password1, password2 } = request.body;
			const db = await request.database;

			User.add(db, firstName, lastName, email, password1, password2)
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
		"/staff",
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

	/* ---- UPDATE ---------------------------------- */
	route.put(
		"/",
		middlewares.checkParams("userId"),
		middlewares.database,
		async (request, response) => {
			const { userId, firstName, lastName, email } = request.body;
			const db = await request.database;

			User.update(db, userId, firstName, lastName, email)
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
		middlewares.checkParams("userId"),
		middlewares.database,
		async (request, response) => {
			const { userId } = request.body;
			const db = await request.database;

			User.deleteStaff(db, userId)
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