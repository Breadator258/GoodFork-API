import bcrypt from "bcrypt";
import config from "../../config/config.js";
import ModelError from "../../global/ModelError.js";

/*****************************************************
 * Checkers
 *****************************************************/

const isValidEmail = email => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isEmailAvailable = async (db, email) => {
	const user = await db.query("SELECT email FROM users WHERE email = ?", [email]);
	return user.length === 0;
};

const isValidPassword = password => {
	return password !== undefined && `${password}`.length >= 8;
};

const isPasswordSafe = password => {
	// At least 8 characters, one upper case letter, one lower case letter, one digit & one special character
	const strongPwd = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})");
	return strongPwd.test(password);
};

const doesPasswordsMatch = (password1, password2) => {
	return password1 === password2;
};

const hashPassword = async password => {
	return await bcrypt.hash(password, config.app.security.saltRound);
};

const doesPasswordMatchHash = async (password, hash) => {
	return await bcrypt.compare(password, hash);
};

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = async (db, firstName, lastName, email, password1, password2) => {
	// Check if something is invalid
	if (!isValidEmail(email)) {
		return new ModelError(400, "You must provide a valid email address.", ["email"]);
	}

	if (!isValidPassword(password1) || !isValidPassword(password2)) {
		return new ModelError(400, "The password must be at least 8 characters long.", ["password"]);
	}

	if (!isPasswordSafe(password1) || !isPasswordSafe(password2)) {
		return new ModelError(400, "The password must be at least 8 characters long, including an upper case letter, a lower case letter, a number and a special character.", ["password"]);
	}

	if (!doesPasswordsMatch(password1, password2)) {
		return new ModelError(400, "The passwords don't match.", ["password"]);
	}

	// Check if something is not available
	if (!await isEmailAvailable(db, email)) {
		return new ModelError(400, "This email address is already taken.", ["email"]);
	}

	// Hash password
	const hashedPwd = await hashPassword(password1);

	// Add the user
	return db.query(`
    INSERT INTO users(firstName, lastName, email, password)
    VALUES (?, ?, ?, ?)
    `, [firstName, lastName ? lastName : null, email, hashedPwd]
	);
};

/* ---- READ ------------------------------------ */
const getStaff = db => {
	return db.query(`
		SELECT
      users.user_id,
      roles.name AS "role",
      users.firstName,
      users.lastName,
      users.email
    FROM users
    LEFT JOIN roles ON users.role_id = roles.role_id
    WHERE roles.name <> "customer"
	`);
};

const getByEmail = (db, email) => {
	if (!isValidEmail(email)) {
		return new ModelError(400, "You must provide a valid email address.", ["email"]);
	}

	return db.query(`
    SELECT
      users.user_id,
      roles.name AS "role",
      users.firstName,
      users.lastName,
      users.email
    FROM users
    LEFT JOIN roles ON users.role_id = roles.role_id
    WHERE users.email = ?
  `, [email]);
};

/* ---- DELETE ---------------------------------- */
const deleteStaff = (db, userId) => {
	return db.query(`
		DELETE users.* FROM users
    LEFT JOIN roles ON users.role_id = roles.role_id
    WHERE roles.name <> "customer" AND users.user_id = ?
	`, [userId]);
};

/*****************************************************
 * Export
 *****************************************************/

const User = { add, getStaff, getByEmail, deleteStaff };
export default User;