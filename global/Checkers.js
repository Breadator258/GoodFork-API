/** @module Checkers */
import Converters from "./Converters.js";

/*****************************************************
 * Checkers
 *****************************************************/
/**
 * @function isDefined
 * @description Check if a value is not null or undefined.
 *
 * @param {*} value - The value to test
 * @returns {Boolean}
 *
 * @example
 * 	Checkers.isDefined("") // return true
 *Checkers.isDefined(65) // return true
 *Checkers.isDefined(false) // return true
 *Checkers.isDefined(null) // return false
 *Checkers.isDefined(undefined) // return false
 */
function isDefined(value) {
	return value !== undefined && value !== null;
}

/**
 * @function strInRange
 * @description Check if a value is a string and if its length is in a given range.
 *
 * @param {*} str - The value to test
 * @param {Number} min - The minimum length of the string (nullable)
 * @param {Number} max - The maximum length of the string (nullable)
 * @param {Boolean} [includeEndpoint=true] - Include the min and max bounds in the range
 * @param {Boolean} [canBeNull=false] - Authorize or not the string to be null or undefined
 * @returns {Boolean}
 *
 * @example
 * 	Checkers.strInRange("sanic", null, 255) // return true
 *Checkers.strInRange("sanic", 5, 255) // return true
 *Checkers.strInRange("sanic", 5, 255, false) // return false
 *Checkers.strInRange(null, null, 255) // return false
 *Checkers.strInRange(null, null, 255,  true, true) // return true
 */
function strInRange(str, min, max, includeEndpoint = true, canBeNull = false) {
	if (isArray(str)) {
		return str.every(s => strInRange(s));
	}

	return isDefined(str)
		? isString(str)
			? includeEndpoint
				? (isDefined(min) ? str.length >= min : true) && (isDefined(max) ? str.length <= max : true)
				: (isDefined(min) ? str.length > min : true) && (isDefined(max) ? str.length < max : true)
			: false
		: canBeNull;
}

/**
 * @function isGreaterThan
 * @description Check if a value is greater (or equal) than another value.
 *
 * @param {*} a - The first value to test
 * @param {*} b - The second value to test
 * @param {Boolean} [canBeEqual=false] - Authorize or not the two values to be equal
 * @returns {Boolean}
 *
 * @example
 * 	Checkers.isGreaterThan(5, 2) // return true
 *Checkers.isGreaterThan(2, 7) // return false
 *Checkers.isGreaterThan(4, 4) // return false
 *Checkers.isGreaterThan(4, 4, true) // return true
 *Checkers.isGreaterThan(null, 5) // return false
 */
function isGreaterThan(a, b, canBeEqual = false) {
	if (!isNumber(a) || !isNumber(b)) return false;
	else return canBeEqual ? (a >= b) : (a > b);
}

/**
 * @function isDateLowerThan
 * @description Check if a date A is before (or equal to) a date B.
 *
 * @param {*} date1 - The first date to test
 * @param {*} date2 - The second date to test
 * @param {Boolean} [canBeEqual=false] - Authorize or not the two dates to be equal
 * @param {Boolean} [canBeNull=false] - Authorize or not the dates to be null or undefined
 * @returns {Boolean}
 *
 * @example
 * 	// First case
 * const date = Date.now()
 *
 * Checkers.isDateLowerThan(date, date) // return false
 * Checkers.isDateLowerThan(date, date, true) // return true
 *
 * // Second case
 *Checkers.isDateLowerThan(null, date) // return false
 *Checkers.isDateLowerThan(null, date, false, true) // return true
 */
function isDateLowerThan(date1, date2, canBeEqual = false, canBeNull = false) {
	if (canBeNull) {
		if (!isDefined(date1) || !isDefined(date2) || isEmptyString(date1) || isEmptyString(date2)) {
			return true;
		}
	}

	const convertedDate1 = Converters.toDate(date1);
	const convertedDate2 = Converters.toDate(date2);

	return isDate(convertedDate1) && isDate(convertedDate2)
		? canBeEqual ? (convertedDate1 <= convertedDate2) : (convertedDate1 < convertedDate2)
		: false;
}

/*****************************************************
 * Regex checkers
 *****************************************************/
/**
 * @function isEmail
 * @description Check if a value is a valid email address.
 *
 * @param {*} email - The email to test
 * @returns {Boolean}
 *
 * @example
 * 	Checkers.isEmail("bourpi@peace.com") // return true
 *Checkers.isGreaterThan("") // return false
 *Checkers.isGreaterThan(null) // return false
 */
function isEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * @function isPasswordSafe
 * @description Check if one or more passwords are safe. A password is safe if it contains at least eight characters
 * with one upper case letter, one lower case letter, one digit and one special character.
 *
 * @param {string|Array<string>} password - The passwords to test
 * @returns {Boolean}
 *
 * @example
 * 	Checkers.isPasswordSafe("Supinfo123!") // return true
 *Checkers.isGreaterThan("motdepasse") // return false
 *Checkers.isGreaterThan(["YoLesN00bs!", "*N3verG0nnaGiv3YouUp*"]) // return true
 */
function isPasswordSafe(password) {
	if (isArray(password)) {
		return password.every(pwd => isPasswordSafe(pwd));
	}

	// At least 8 characters, one upper case letter, one lower case letter, one digit & one special character
	const strongPwd = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})");
	return strongPwd.test(password);
}

/*****************************************************
 * Type checkers
 *****************************************************/
/**
 * @function isString
 * @description Check if a value is a string
 *
 * @param {*} value - The value to test
 * @returns {Boolean}
 *
 * @example
 * 	Checkers.isString("") // return true
 *Checkers.isString("yo") // return true
 *Checkers.isString(5) // return false
 *Checkers.isString(null) // return false
 */
function isString(value) {
	return Object.prototype.toString.call(value) === "[object String]";
}

/**
 * @function isEmptyString
 * @description Check if a value is an empty string
 *
 * @param {*} value - The value to test
 * @returns {Boolean}
 *
 * @example
 * 	Checkers.isEmptyString("") // return true
 *Checkers.isString("yo") // return false
 *Checkers.isString(5) // return false
 *Checkers.isString(null) // return false
 */
function isEmptyString(value) {
	return isString(value)
		? value.length === 0
		: false;
}

/**
 * @function isNumber
 * @description Check if a value is a number
 *
 * @param {*} value - The value to test
 * @returns {Boolean}
 *
 * @example
 * 	Checkers.isNumber(5) // return true
 *Checkers.isNumber(6.74) // return true
 *Checkers.isNumber("7") // return false
 *Checkers.isNumber(null) // return false
 */
function isNumber(value) {
	return typeof value === "number";
}

/**
 * @function isArray
 * @description Check if a value is an array
 *
 * @param {*} value - The value to test
 * @returns {Boolean}
 *
 * @example
 * 	Checkers.isArray([]) // return true
 *Checkers.isArray([5, 4, "car"]) // return true
 *Checkers.isArray(null) // return false
 */
function isArray(value) {
	return Array.isArray(value);
}

/**
 * @function isDate
 * @description Check if a value is a date and if it's a valid date
 *
 * @param {*} value - The value to test
 * @returns {Boolean}
 *
 * @example
 * 	Checkers.isDate(new Date()) // return true
 *Checkers.isDate(Date.now()) // return true
 *Checkers.isDate(null) // return false
 */
function isDate(value) {
	return Object.prototype.toString.call(value) === "[object Date]"
		? !!value.getDate()
		: false;
}

/*****************************************************
 * Export
 *****************************************************/
const Checkers = {
	isDefined, strInRange, isGreaterThan, isDateLowerThan,
	isEmail, isPasswordSafe,
	isString, isEmptyString, isNumber, isArray, isDate
};
export default Checkers;