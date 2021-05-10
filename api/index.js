import { Router } from "express";
import users from "./routes/users.js";
import stock from "./routes/stock.js";
import tables from "./routes/tables";

export default () => {
	const router = Router();

	users(router);
	stock(router);
	tables(router);

	return router;
};