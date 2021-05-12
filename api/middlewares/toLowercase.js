export default function toLowercase(...paramsNames) {
	return (request, response, next) => {
		const params = request.method.toUpperCase() === "GET" ? request.params : request.body;
		const lowerCasedParams = params;

		// Search for every parameter name and value
		paramsNames.forEach((name) => {
			if (Object.prototype.hasOwnProperty.call(params, name)) {
				const param = params[name];

				if (isString(param)) {
					lowerCasedParams[name] = param.toLowerCase();
				}
			}
		});

		request.lowerCasedParams = lowerCasedParams;

		return next();
	};
}

function isString(value) {
	return Object.prototype.toString.call(value) === "[object String]";
}