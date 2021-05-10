import bcrypt from "bcrypt";
import generatePwd from "generate-password";
import config from "../../config/config.js";
import Mail from "../../global/Mail.js";
import ModelError from "../../global/ModelError.js";
import { getFieldsToUpdate } from "../../global/Functions.js";

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

const isRoleValid = async (db, role) => {
	const roleFound = await db.query("SELECT role_id FROM roles WHERE role_id = ?", [role]);
	return roleFound.length > 0;
};

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
const add = async (db, first_name, last_name, email, password1, password2) => {
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
    INSERT INTO users(first_name, last_name, email, password)
    VALUES (?, ?, ?, ?)
    `, [first_name, last_name ? last_name : null, email, hashedPwd]
	);
};

const addStaff = async (db, first_name, last_name, email, role) => {
	// Check if something is invalid
	if (!isValidEmail(email)) {
		return new ModelError(400, "You must provide a valid email address.", ["email"]);
	}

	// Check if something is not available
	if (!await isEmailAvailable(db, email)) {
		return new ModelError(400, "This email address is already taken.", ["email"]);
	}

	if (!await isRoleValid(db, role)) {
		return new ModelError(400, "The selected role doesn't exist.", ["role"]);
	}

	// Create password
	const password = generatePwd.generate({ length: 8, numbers: true, symbols: true, excludeSimilarCharacters: true, strict: true });
	const hashedPwd = await hashPassword(password);

	// Add the staff
	await db.query(`
    INSERT INTO users(role_id, first_name, last_name, email, password)
    VALUES (?, ?, ?, ?, ?)
    `, [role, first_name, last_name ? last_name : null, email, hashedPwd]
	);

	// Return the password
	try {
		await Mail.sendPassword(email, password);
		return { code: 202, message: "Staff added." };
	} catch (err) {
		return new ModelError(500, "Could not send password to the new staff member's email address.");
	}
};

/* ---- READ ------------------------------------ */
const getStaff = db => {
	return db.query(`
		SELECT
      users.user_id,
      roles.name AS "role",
      users.first_name,
      users.last_name,
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
      users.first_name,
      users.last_name,
      users.email
    FROM users
    LEFT JOIN roles ON users.role_id = roles.role_id
    WHERE users.email = ?
  `, [email]);
};

/* ---- UPDATE ---------------------------------- */
// TODO: Make possible to update role
const update = (db, user_id, first_name, last_name, email) => {
	const updatingFields = getFieldsToUpdate({ first_name, last_name, email });

	// Update the user
	return db.query(`UPDATE users SET ${updatingFields} WHERE user_id = ?`, [user_id]);
};

/* ---- DELETE ---------------------------------- */
const deleteStaff = (db, user_id) => {
	return db.query(`
		DELETE users.* FROM users
    LEFT JOIN roles ON users.role_id = roles.role_id
    WHERE roles.name <> "customer" AND users.user_id = ?
	`, [user_id]);
};

/*****************************************************
 * Export
 *****************************************************/

const User = { add, addStaff, getStaff, getByEmail, update, deleteStaff };
export default User;