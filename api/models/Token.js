/** @module models/Token */
import { promisify } from "util";
import crypto from "crypto";
import base64url from "base64url";
import ModelError from "../../global/ModelError.js";
import Checkers from "../../global/Checkers.js";

const randomBytesAsync = promisify(crypto.randomBytes);

/**
 * A Token
 * @typedef {Object} Token
 * @property {Number} token_id - ID of the token
 * @property {Number} user_id - ID of the user associated to this token
 * @property {string} token - The token itself
 */

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
/**
 * @function add
 * @async
 * @description Add a token
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} user_id - ID of the user associated to this token
 * @param {string} token - The token itself
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	Token.add(db, 45, "UkZaV1BaWDByTjZvUlkwWWhCdUFoajBJUWowdng3VFE1WU9uM3hxZXUvVWRoVlIybTB4R2NHSXUzWnJRVm9pVA")
 */
const add = async (db, user_id, token) => {
	if (!Checkers.strInRange(token, null, 255)) {
		return new ModelError(400, "Token is invalid (undefined or wrong length).");
	}

	return db.query(`
    INSERT INTO tokens(user_id, token)
    VALUES (?, ?)
    `, [user_id, token]
	);
};

/* ---- READ ------------------------------------ */
/**
 * @function getNew
 * @async
 * @description Generate a new token
 * @todo Add an expiration date to the token
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} user_id - ID of the user associated to this token
 * @returns {Promise<string>} The generated token
 *
 * @example
 * 	Token.add(db, 45, "UkZaV1BaWDByTjZvUlkwWWhCdUFoajBJUWowdng3VFE1WU9uM3hxZXUvVWRoVlIybTB4R2NHSXUzWnJRVm9pVA")
 */
const getNew = async (db, user_id) => {
	const buf = await randomBytesAsync(48);
	const randomToken = base64url(buf.toString("base64"));
	await add(db, user_id, randomToken);

	return randomToken;
};

/**
 * @function getUserId
 * @async
 * @description Get the associated user's ID using a token
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} token - The token itself
 * @returns {Promise<Number|ModelError>} The user ID or a ModelError
 *
 * @example
 * 	Token.getUserId(db, 45)
 */
const getUserId = async (db, token) => {
	const user_id = await db.query("SELECT user_id FROM tokens WHERE token = ? LIMIT 1", [token]);
	return user_id[0] ? user_id[0].user_id : new ModelError(400, "No user found associated with this token");
};

/*****************************************************
 * Export
 *****************************************************/

const Token = { getNew, getUserId };
export default Token;