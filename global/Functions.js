export function getFieldsToUpdate(fields) {
	let updatingFields = [];

	Object.entries(fields).forEach(([key, value]) => {
		if (value) {
			updatingFields.push(`${key} = "${value}"`);
		}
	});

	return updatingFields.join(", ");
}