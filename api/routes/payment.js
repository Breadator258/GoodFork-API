import { Router } from "express";
import middlewares from "../middlewares/index.js";
import ModelError from "../../global/ModelError.js";
import Payment from "../models/Payment.js";

const route = Router();

export default (router) => {
	router.use("/payment", route);

	/* ---- CREATE ---------------------------------- */
	route.post(
		"/takeaway",
		middlewares.checkParams("user_id", "menus"),
		middlewares.database,
		async (request, response) => {
			const { user_id, additional_infos, menus } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Payment.payTakeAway(db, user_id, additional_infos, menus)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Commande à emporter payée." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);

	route.post(
		"/booking",
		middlewares.checkParams("booking_id"),
		middlewares.database,
		async (request, response) => {
			const { booking_id } = request.body;
			const db = await request.database;

			response.set("Content-Type", "application/json");

			Payment.payBooking(db, booking_id)
				.then(result => {
					if (result instanceof ModelError) {
						response.status(result.code()).json(result.json()).end();
					} else {
						response.status(202).json({ code: 202, message: "Réservation payée." }).end();
					}
				})
				.catch(err => response.status(500).json(new ModelError(500, err.message).json()).end())
				.finally(() => db ? db.release() : null);
		}
	);
};