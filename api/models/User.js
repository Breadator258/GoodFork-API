/** @module models/User */
import bcrypt from "bcryptjs";
import generatePwd from "generate-password";
import config from "../../config/config.js";
import Mail from "../../global/Mail.js";
import Role from "./Role.js";
import Token from "./Token.js";
import ModelError from "../../global/ModelError.js";
import Checkers from "../../global/Checkers.js";
import { getFieldsToUpdate } from "../../global/Functions.js";

/**
 * A User
 * @typedef {Object} User
 * @property {Number} user_id - ID of the user
 * @property {Number} role_id - ID of its role {@see module:models/Role}
 * @property {string} first_name - User first name
 * @property {string} [last_name] - User last name
 * @property {string} email - User email address
 * @property {string} [password] - User password protected by hash
 */

/*****************************************************
 * Functions
 *****************************************************/

/**
 * @ignore
 * @function isRoleValid
 * @async
 * @description Check if a role is valid
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} role - Role name
 * @returns {Promise<Boolean>}
 *
 * @example
 * 	isRoleValid(db, "owner") // return true
 *isRoleValid(db, "plouf") // return false
 */
const isRoleValid = async (db, role) => {
	const roleFound = await db.query("SELECT role_id FROM roles WHERE role_id = ?", [role]);
	return roleFound.length > 0;
};

/**
 * @ignore
 * @function isEmailAvailable
 * @async
 * @description Check if an email address is available
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} email - Email to search for
 * @returns {Promise<Boolean>}
 *
 * @example
 * 	isEmailAvailable(db, "johnny.sin@nrop.com")
 */
const isEmailAvailable = async (db, email) => {
	const user = await db.query("SELECT email FROM users WHERE email = ?", [email]);
	return user.length === 0;
};

/**
 * @ignore
 * @function hashPassword
 * @async
 * @description Hash a password
 *
 * @param {string} password - Password to hash
 * @returns {Promise<string>} The hashed password
 *
 * @example
 * 	hashPassword("Th1sIsMyP4$$word")
 */
const hashPassword = async password => {
	return await bcrypt.hash(password, config.app.security.saltRound);
};

/**
 * @ignore
 * @function doesPasswordMatchHash
 * @async
 * @description Check if a password match its hashed version
 *
 * @param {string} password - Password to test
 * @param {string} hash - Hashed version of the password
 * @returns {Promise<Boolean>}
 *
 * @example
 * 	isEmailAvailable(db, "johnny.sin@nrop.com")
 */
const doesPasswordMatchHash = async (password, hash) => {
	return await bcrypt.compare(password, hash);
};

/*****************************************************
 * CRUD Methods
 *****************************************************/

/* ---- CREATE ---------------------------------- */
/**
 * @function add
 * @async
 * @description Add a user
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} first_name - User first name
 * @param {string} [last_name] - User last name
 * @param {string} email - User email address
 * @param {string} password1 - Password
 * @param {string} password2 - Password confirmation
 * @returns {Promise<User|ModelError>} The newly added user or a ModelError
 *
 * @example
 * 	User.add(db, "Daft", "Punk", "daft.punk@elect.ro", "0neMor3T1me!", "0neMor3T1me!")
 */
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

	return getById(db, user.insertId);
};

/**
 * @function addStaff
 * @async
 * @description Add a staff member. His password is sent to the given email address.
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} first_name - User first name
 * @param {string} [last_name] - User last name
 * @param {string} email - User email address
 * @param {string} role - His role name
 * @returns {Promise<{code: Number, message: string}|ModelError>} A confirmation message or a ModelError
 *
 * @example
 * 	User.addStaff(db, "Daft", "Punk", "daft.punk@elect.ro", "cook")
 */
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
/**
 * @function login
 * @async
 * @description Login a user
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} email - User email address
 * @param {string} password - User password
 * @param {string} [roleLevel] - The minimum role needed to log in
 * @returns {Promise<User|ModelError>} The logged in user or a ModelError
 *
 * @example
 * 	User.login(db, "daft.punk@elect.ro", ""0neMor3T1me!")
 *User.login(db, "daft.punk@elect.ro", ""0neMor3T1me!", "cook")
 */
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

/**
 * @function loginWithToken
 * @async
 * @description Login a user using its token
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} token - User token
 * @param {string} [roleLevel] - The minimum role needed to log in
 * @returns {Promise<User|ModelError>} The logged in user or a ModelError
 *
 * @example
 * 	User.loginWithToken(db, "UkZaV1BaWDByTjZvUlkwWWhCdUFoajBJUWowdng3VFE1WU9uM3hxZXUvVWRoVlIybTB4R2NHSXUzWnJRVm9pVA")
 */
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

/**
 * @function getStaff
 * @async
 * @description Get all staff members
 *
 * @param {Promise<void>} db - Database connection
 * @returns {Promise<Array<User>|ModelError>} A list of users or a ModelError
 *
 * @example
 * 	User.getStaff(db)
 */
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

/**
 * @ignore
 * @function getPwdByEmail
 * @async
 * @description Get a user by its email but fetch his password too. Use only for internal processing.
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} email - User email address
 * @returns {Promise<User|ModelError>} A user or a ModelError
 *
 * @example
 * 	User.getPwdByEmail(db, "daft.punk@elect.ro")
 */
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

/**
 * @function getByEmail
 * @async
 * @description Get a user by its email
 * @todo Keep it?
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} email - User email address
 * @returns {Promise<User|ModelError>} A user or a ModelError
 *
 * @example
 * 	User.getByEmail(db, "daft.punk@elect.ro")
 */
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

/**
 * @function getById
 * @async
 * @description Get a user by its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} user_id - User ID
 * @returns {Promise<User|ModelError>} A user or a ModelError
 *
 * @example
 * 	User.getById(db, 45)
 */
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
/**
 * @function update
 * @async
 * @description Update a user using its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} user_id - User ID
 * @param {Number} [role_id] - ID of its role {@see module:models/Role}
 * @param {string} [first_name] - User first name
 * @param {string} [last_name] - User last name
 * @param {string} [email] - User email address
 * @returns {Promise<void|ModelError>} Nothing or a ModelError
 *
 * @example
 * 	User.update(db, 45, null, null, "Punk!" null)
 */
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
/**
 * @function deleteStaff
 * @async
 * @description Delete a staff member using its ID
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} user_id - User ID
 * @returns {Promise<void>}
 *
 * @example
 * 	User.deleteStaff(db, 45)
 */
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