import { promisify } from "util";
import crypto from "crypto";
import base64url from "base64url";

const randomBytesAsync = promisify(crypto.randomBytes);

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = (db, user_id, token) => {
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