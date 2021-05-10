export function getFieldsToUpdate(fields) {
	let updatingFields = [];

	Object.entries(fields).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			updatingFields.push(`${key} = "${convertValue(value)}"`);
		}
	});

	return updatingFields.join(", ");
}

function convertValue(value) {
	if (typeof value === "boolean") {
		return value ? 1 : 0;
	}

	return value;
}