/** @module middlewares */
import Checkers from "../../global/Checkers.js";

/**
 * @function checkParams
 * @description Check if a parameter is present or not is the request
 *
 * @param {...string} paramsNames - Names of the required parameters
 * @returns {function(Request, Response, function): *}
 *
 * @example
 * 	route.post("/", middlewares.checkParams("user_id", "time", "clients_nb"), (request, response) => {
 *		...
 *	});
 */
export default function checkParams(...paramsNames) {
	return (request, response, next) => {
		const params = request.method.toUpperCase() === "GET" ? request.params : request.body;
		const missing = [];
		const addMissingParam = n => missing.push(n);

		// Search for every parameter name and value
		paramsNames.forEach((name) => {
			if (Object.prototype.hasOwnProperty.call(params, name)) {
				const param = params[name];

				if (!Checkers.isDefined(param)) addMissingParam(name);
				if (Checkers.isString(param)){
					if (!Checkers.strInRange(param, 1, null)) addMissingParam(name);
				}
			} else {
				addMissingParam(name);
			}
		});

		// End the request if something is missing
		if (missing.length > 0) {
			const plural = missing.length > 1 ? "s" : "";

			return response.status(400).json({
				code: 400,
				error: `Paramètre${plural} manquant${plural}: ${missing.join(", ")}`
			}).end();
		}

		return next();
	};
}