import { Router } from "express";
import users from "./routes/users.js";
import roles from "./routes/roles.js";
import stock from "./routes/stock.js";
import tables from "./routes/tables.js";

export default () => {
	const router = Router();

	users(router);
	roles(router);
	stock(router);
	tables(router);

	return router;
};