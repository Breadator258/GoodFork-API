/** @module Converters */
import Checkers from "./Checkers.js";

/**
 * @function toNumber
 * @description Tries to convert a value to a Number
 *
 * @param {*} value - The value to convert
 * @returns {Number|*} The converted number or the value
 *
 * @example
 * 	Converters.toNumber(5) // return 5
 *Converters.toNumber("5.6") // return 5.6
 *Converters.toNumber("5,6") // return 5.6
 *Converters.toNumber(null) // return null
 *Converters.toNumber("salut") // return "salut"
 */
function toNumber(value) {
	return Checkers.isNumber(value)
		? value
		: Checkers.isString(value) ? (value.replace(",", ".") * 1) : NaN;
}

/**
 * @function toDate
 * @description Tries to convert a value to a Date
 *
 * @param {*} d - The value to convert
 * @returns {Date|*} The converted date or the value
 *
 * @example
 * 	Converters.toDate(null) // return null
 *Converters.toNumber("2021-06-03 15:10:00") // return Date
 */
function toDate(d) {
	return (
		d === null ? d :
			d === undefined ? d :
				d.constructor === Date ? d :
					d.constructor === Array ? new Date(d[0],d[1],d[2]) :
						d.constructor === Number ? new Date(d) :
							d.constructor === String ? new Date(d) :
								typeof d === "object" ? new Date(d.year,d.month,d.date) :
									NaN
	);
}

/*****************************************************
 * Export
 *****************************************************/
const Converters = { toNumber, toDate };
export default Converters;