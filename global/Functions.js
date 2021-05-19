/*****************************************************
 * Update
 *****************************************************/

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

function convertValue(value) {
	if (typeof value === "boolean") {
		return value ? 1 : 0;
	}

	return value;
}

/*****************************************************
 * Date
 *****************************************************/

export function convertDate(d) {
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