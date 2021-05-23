import bcrypt from "bcryptjs";
import generatePwd from "generate-password";
import config from "../../config/config.js";
import Mail from "../../global/Mail.js";
import Role from "./Role.js";
import Token from "./Token.js";
import ModelError from "../../global/ModelError.js";
import Checkers from "../../global/Checkers.js";
import { getFieldsToUpdate } from "../../global/Functions.js";

/*****************************************************
 * Functions
 *****************************************************/

const isRoleValid = async (db, role) => {
	const roleFound = await db.query("SELECT role_id FROM roles WHERE role_id = ?", [role]);
	return roleFound.length > 0;
};

const isEmailAvailable = async (db, email) => {
	const user = await db.query("SELECT email FROM users WHERE email = ?", [email]);
	return user.length === 0;
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
const add = async (db, first_name, last_name, email, password1, password2) => {
	// Check if something is invalid
	if (!Checkers.strInRange(first_name, null, 255)) {
		return new ModelError(400, "You must provide a valid first name (max. 255 characters).", ["first_name"]);
	}

	if (!Checkers.strInRange(last_name, null, 255, true, true)) {
		return new ModelError(400, "You must provide a valid last name (max. 255 characters).", ["last_name"]);
	}

	if (!Checkers.isEmail(email)) {
		return new ModelError(400, "You must provide a valid email address.", ["email"]);
	}

	if (!Checkers.strInRange([password1, password2], 8, null)) {
		return new ModelError(400, "The password must be at least 8 characters long.", ["password"]);
	}

	if (!Checkers.isPasswordSafe([password1, password2])) {
		return new ModelError(400, "The password must be at least 8 characters long, including an upper case letter, a lower case letter, a number and a special character.", ["password"]);
	}

	if (password1 !== password2) {
		return new ModelError(400, "The passwords don't match.", ["password"]);
	}

	// Check if something is not available
	if (!await isEmailAvailable(db, email)) {
		return new ModelError(400, "This email address is already taken.", ["email"]);
	}

	// Hash password
	const hashedPwd = await hashPassword(password1);

	// Add the user
	const user = await db.query(`
    INSERT INTO users(first_name, last_name, email, password)
    VALUES (?, ?, ?, ?)
    `, [first_name, last_name ? last_name : null, email, hashedPwd]
	);

	return getById(user.insertId);
};

const addStaff = async (db, first_name, last_name, email, role) => {
	// Check if something is invalid
	if (!Checkers.strInRange(first_name, null, 255)) {
		return new ModelError(400, "You must provide a valid first name (max. 255 characters).", ["first_name"]);
	}

	if (!Checkers.strInRange(last_name, null, 255, true, true)) {
		return new ModelError(400, "You must provide a valid last name (max. 255 characters).", ["last_name"]);
	}

	if (!Checkers.isEmail(email)) {
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
const login = async (db, email, password, roleLevel) => {
	if (!Checkers.isEmail(email)) {
		return new ModelError(400, "You must provide a valid email address.", ["email"]);
	}

	if (!Checkers.strInRange(password, 8, null)) {
		return new ModelError(400, "The password must be at least 8 characters long.", ["password"]);
	}

	let user = await getPwdByEmail(db, email);
	if (user instanceof ModelError) return user;

	// Check the role
	if (roleLevel) {
		const role = await Role.getByName(db, roleLevel);
		if (role instanceof ModelError) return role;

		if (user.role !== roleLevel) {
			return new ModelError(401, "You haven't the required privileges to log in here.");
		}
	}

	const canConnect = user ? await doesPasswordMatchHash(password, user.password) : false;

	if (!canConnect) {
		return new ModelError(400, "No users were found with this email and password combination.", ["email", "password"]);
	} else {
		delete user.password;
		return user;
	}
};

const loginWithToken = async (db, token, roleLevel) => {
	if (!Checkers.strInRange(token, null, 255)) {
		return new ModelError(400, "You must provide a valid token", ["token"]);
	}

	// Get user
	const user_id = await Token.getUserId(db, token);
	if (user_id instanceof ModelError) return user_id;

	const user = await getById(db, user_id);
	if (user instanceof ModelError) return user;

	// Check the role
	if (roleLevel) {
		const role = await Role.getByName(db, roleLevel);
		if (role instanceof ModelError) return role;

		if (user.role !== roleLevel) {
			return new ModelError(401, "You haven't the required privileges to log in here.");
		}
	}

	return user;
};

const getStaff = db => {
	return db.query(`
		SELECT
      users.user_id,
      roles.role_id,
      roles.name AS "role",
      users.first_name,
      users.last_name,
      users.email
    FROM users
    LEFT JOIN roles ON users.role_id = roles.role_id
    WHERE roles.name <> "customer"
    ORDER BY users.user_id
	`);
};

const getPwdByEmail = async (db, email) => {
	const user = await db.query(`
    SELECT
      users.user_id,
      roles.role_id,
      roles.name AS "role",
      users.first_name,
      users.last_name,
      users.email,
      users.password
    FROM users
    LEFT JOIN roles ON users.role_id = roles.role_id
    WHERE users.email = ?
  `, [email]);

	return user[0] ? user[0] : new ModelError(404, "No user found with this email address.");
};

// TODO: Keep it?
const getByEmail = async (db, email) => {
	if (!Checkers.isEmail(email)) {
		return new ModelError(400, "You must provide a valid email address.", ["email"]);
	}

	const user =  db.query(`
    SELECT
      users.user_id,
      roles.role_id,
      roles.name AS "role",
      users.first_name,
      users.last_name,
      users.email
    FROM users
    LEFT JOIN roles ON users.role_id = roles.role_id
    WHERE users.email = ?
  `, [email]);

	return user[0] ? user[0] : new ModelError(404, "No user found with this email address.");
};

const getById = async (db, user_id) => {
	const user = await db.query(`
    SELECT
      users.user_id,
      roles.role_id,
      roles.name AS "role",
      users.first_name,
      users.last_name,
      users.email
    FROM users
    LEFT JOIN roles ON users.role_id = roles.role_id
    WHERE users.user_id = ?
    LIMIT 1
  `, [user_id]);

	return user[0] ? user[0] : new ModelError(404, "No user found with this user id.");
};

/* ---- UPDATE ---------------------------------- */
const update = async (db, user_id, role_id, first_name, last_name, email) => {
	if (!Checkers.strInRange(first_name, null, 255, true, true)) {
		return new ModelError(400, "You must provide a valid first name (max. 255 characters).", ["first_name"]);
	}

	if (!Checkers.strInRange(last_name, null, 255, true, true)) {
		return new ModelError(400, "You must provide a valid last name (max. 255 characters).", ["last_name"]);
	}

	const updatingFields = getFieldsToUpdate({ role_id, first_name, last_name, email });
	if (!updatingFields) return new ModelError(200, "Nothing to update");

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

const User = { add, addStaff, login, loginWithToken, getStaff, getByEmail, getById, update, deleteStaff };
export default User;