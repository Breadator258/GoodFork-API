import { promisify } from "util";
import crypto from "crypto";
import base64url from "base64url";
import ModelError from "../../global/ModelError.js";
import Checkers from "../../global/Checkers.js";

const randomBytesAsync = promisify(crypto.randomBytes);

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = (db, user_id, token) => {
	if (!Checkers.strInRange(token, null, 255)) {
		return new ModelError(400, "Token is invalid (undefined or wrong length).", ["token"]);
	}

	return db.query(`
    INSERT INTO tokens(user_id, token)
    VALUES (?, ?)
    `, [user_id, token]
	);
};

// TODO: Add token expiration date
const getNew = async (db, user_id) => {
	const buf = await randomBytesAsync(48);
	const randomToken = base64url(buf.toString("base64"));
	await add(db, user_id, randomToken);

	return randomToken;
};

/*****************************************************
 * Export
 *****************************************************/

const Token = { getNew };
export default Token;