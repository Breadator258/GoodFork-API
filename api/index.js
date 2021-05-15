import { Router } from "express";
import users from "./routes/users.js";
import roles from "./routes/roles.js";
import stock from "./routes/stock.js";
import units from "./routes/units.js";
import menus from "./routes/menus.js";
import tables from "./routes/tables.js";
import bookings from "./routes/bookings.js";

export default () => {
	const router = Router();

	users(router);
	roles(router);
	stock(router);
	units(router);
	menus(router);
	tables(router);
	bookings(router);

	return router;
};