import { Router } from "express";
import users from "./routes/users.js";
import roles from "./routes/roles.js";
import stock from "./routes/stock.js";
import units from "./routes/units.js";
import measurement from "./routes/measurement.js";
import menus from "./routes/menus.js";
import menuTypes from "./routes/menuTypes.js";
import tables from "./routes/tables.js";
import bookings from "./routes/bookings.js";
import orders from "./routes/orders.js";
import orderMenus from "./routes/orderMenus.js";

export default () => {
	const router = Router();

	users(router);
	roles(router);
	stock(router);
	units(router);
	measurement(router);
	menus(router);
	menuTypes(router);
	tables(router);
	bookings(router);
	orders(router);
	orderMenus(router);

	return router;
};