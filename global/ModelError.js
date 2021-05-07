export default class ModelError {
	constructor(code = null, message = null, fields = null) {
		this._code = code;
		this._message = message;
		this._fields = fields;
	}

	code() {
		return this._code || 500;
	}

	message() {
		return this._message || "Unknown error";
	}

	fields() {
		return this._fields || [];
	}

	json() {
		return { code: this.code(), error: this.message(), fields: this.fields() };
	}
}