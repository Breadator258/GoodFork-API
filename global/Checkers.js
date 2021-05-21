import Converters from "./Converters.js";

/*****************************************************
 * Checkers
 *****************************************************/
function isDefined(value) {
	return value !== undefined && value !== null;
}

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

function isGreaterThan(a, b, canBeEqual = false) {
	if (!isNumber(a) || !isNumber(b)) return false;
	else return canBeEqual ? (a >= b) : (a > b);
}

function isDateLowerThan(date1, date2, canBeEqual = false, canBeNull = false) {
	if (canBeNull) {
		if (!isDefined(date1) || !isDefined(date2)) {
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
function isEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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
function isString(value) {
	return Object.prototype.toString.call(value) === "[object String]";
}

function isNumber(value) {
	return typeof value === "number";
}

function isArray(value) {
	return Array.isArray(value);
}

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
	isString, isNumber, isArray, isDate
};
export default Checkers;