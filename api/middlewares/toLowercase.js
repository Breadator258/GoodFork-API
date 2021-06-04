/** @module middlewares */
import Checkers from "../../global/Checkers.js";

/**
 * @function toLowercase
 * @description Transform query parameters into lowercase strings placed in request.lowerCasedParams.[NAME]
 *
 * @param {...string} paramsNames - Names of the parameters
 * @returns {function(Request, Response, function): *}
 *
 * @example
 * 	route.post("/", middlewares.toLowercase("email"), (request, response) => {
 *		...
 *	});
 */
export default function toLowercase(...paramsNames) {
	return (request, response, next) => {
		const params = request.method.toUpperCase() === "GET" ? request.params : request.body;
		const lowerCasedParams = params;

		// Search for every parameter name and value
		paramsNames.forEach((name) => {
			if (Object.prototype.hasOwnProperty.call(params, name)) {
				const param = params[name];

				if (Checkers.isString(param)) {
					lowerCasedParams[name] = param.toLowerCase();
				}
			}
		});

		request.lowerCasedParams = lowerCasedParams;

		return next();
	};
}