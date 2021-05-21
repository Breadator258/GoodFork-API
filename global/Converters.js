import Checkers from "./Checkers.js";

function toNumber(value) {
	return Checkers.isNumber(value)
		? value
		: Checkers.isString(value) ? (value.replace(",", ".") * 1) : NaN;
}

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