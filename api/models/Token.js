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
		return new ModelError(400, "Token is invalid (undefined or wrong length).");
	}

	return db.query(`
    INSERT INTO tokens(user_id, token)
    VALUES (?, ?)
    `, [user_id, token]
	);
};

/* ---- READ ------------------------------------ */
// TODO: Add token expiration date
const getNew = async (db, user_id) => {
	const buf = await randomBytesAsync(48);
	const randomToken = base64url(buf.toString("base64"));
	await add(db, user_id, randomToken);

	return randomToken;
};

const getUserId = async (db, token) => {
	const user_id = await db.query("SELECT user_id FROM tokens WHERE token = ? LIMIT 1", [token]);
	return user_id[0] ? user_id[0].user_id : new ModelError(400, "No user found associated with this token");
};

/*****************************************************
 * Export
 *****************************************************/

const Token = { getNew, getUserId };
export default Token;