/**
 * A class that is used to show error message in the server response
 * @class
 * @constructor
 * @public
 */
class ModelError {
	/**
	 * @description Create a new error
	 *
	 * @param {Number|string|null} [code] - HTTP error code
	 * @param {string|null} [message] - Error message
	 * @param {Array<string>|null} [fields] - In which field the error may have occurred
	 *
	 * @example
	 *	import ModelError from "./ModelError.js";
	 *
	 *new ModelError(400, "You must provide a valid email address", "email);
	 */
	constructor(code = null, message = null, fields = null) {
		/** @private */ this._code = code;
		/** @private */ this._message = message;
		/** @private */ this._fields = fields;
	}

	/**
	 * @function code
	 * @memberOf ModelError
	 * @description Return the error code
	 *
	 * @return {Number|string}
	 */
	code() {
		return this._code || 500;
	}

	/**
	 * @function message
	 * @memberOf ModelError
	 * @description Return the error message
	 *
	 * @return {string}
	 */
	message() {
		return this._message || "Unknown error";
	}

	/**
	 * @function fields
	 * @memberOf ModelError
	 * @description Return the error fields
	 *
	 * @return {Array<string>}
	 */
	fields() {
		return this._fields || [];
	}

	/**
	 * @function json
	 * @memberOf ModelError
	 * @description Return every property in a object
	 *
	 * @return {Object}
	 */
	json() {
		return { code: this.code(), error: this.message(), fields: this.fields() };
	}
}

export default ModelError;