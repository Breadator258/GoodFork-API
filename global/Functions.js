/** @module Functions */
/*****************************************************
 * Update
 *****************************************************/
/**
 * @function getFieldsToUpdate
 * @description Filter an object to remove every null or undefined properties.
 *
 * @param {Object} fields - The object to clean
 * @returns {Object} The cleaned object
 *
 * @example
 *  import { getFieldsToUpdate } from "./Function.js";
 *
 *getFieldsToUpdate({prop: 1, other: "yes", what: null}) // return {prop: 1, other: "yes"}
 */
export function getFieldsToUpdate(fields) {
	let updatingFields = [];

	Object.entries(fields).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			updatingFields.push(`${key} = "${convertValue(value)}"`);
		}
	});

	const queryStr = updatingFields.join(", ");
	return queryStr.length > 0 ? queryStr : null;
}

/**
 * @function convertValue
 * @description Convert a value to a SQL valid one
 *
 * @param {*} value - The value to convert
 * @returns {*} The converted value
 *
 * @example
 *  import { convertValue } from "./Function.js";
 *
 *convertValue(true) // return 1
 *convertValue("yooo") // return "yooo"
 */
function convertValue(value) {
	if (typeof value === "boolean") {
		return value ? 1 : 0;
	}

	return value;
}