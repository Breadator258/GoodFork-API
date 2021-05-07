export default function checkParams(...paramsNames) {
	return (request, response, next) => {
		const params = request.method.toUpperCase() === "GET" ? request.params : request.body;
		const missing = [];
		const addMissingParam = n => missing.push(n);

		// Search for every parameter name and value
		paramsNames.forEach((name) => {
			if (Object.prototype.hasOwnProperty.call(params, name)) {
				const param = params[name];

				if (isNullOrUndefined(param)) addMissingParam(name);
				if (isEmptyString(param)) addMissingParam(name);
			} else {
				addMissingParam(name);
			}
		});

		// End the request if something is missing
		if (missing.length > 0) {
			return response.json({
				code: 400,
				error: `Missing parameter${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`
			}).status(400).end();
		}

		return next();
	};
}

function isNullOrUndefined(value) {
	return value === undefined || value === null;
}

function isEmptyString(value) {
	return Object.prototype.toString.call(value) === "[object String]" ? value.length === 0 : false;
}