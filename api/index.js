import { Router } from "express";
import users from "./routes/users.js";
import stock from "./routes/stock.js";

export default () => {
	const router = Router();

	users(router);
	stock(router);

	return router;
};