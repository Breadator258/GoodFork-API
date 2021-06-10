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
 * @see {@link module:models/Role}
 *
 * @property {Number} user_id - ID of the user
 * @property {Number} role_id - ID of its role
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
 * @async
 * @function isRoleIDValid
 * @description Check if an ID is a valid role
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} role_id - ID of the role
 * @returns {Promise<Boolean>}
 *
 * @example
 * 	isRoleIDValid(db, 1)
 */
const isRoleIDValid = async (db, role_id) => {
	const roleFound = await db.query("SELECT role_id FROM roles WHERE role_id = ?", [role_id]);
	return roleFound.length > 0;
};

/**
 * @ignore
 * @async
 * @function isEmailAvailable
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
 * @async
 * @function hashPassword
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
 * @async
 * @function doesPasswordMatchHash
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
 * @async
 * @function add
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
		return new ModelError(400, "Vous devez fournir un prénom valide. (max. 255 caractères).", ["first_name"]);
	}

	if (!Checkers.strInRange(last_name, null, 255, true, true)) {
		return new ModelError(400, "Vous devez fournir un nom valide. (max. 255 caractères).", ["last_name"]);
	}

	if (!Checkers.isEmail(email)) {
		return new ModelError(400, "Vous devez fournir une adresse e-mail valide.", ["email"]);
	}

	if (!Checkers.strInRange([password1, password2], 8, null)) {
		return new ModelError(400, "Le mot de passe doit contenir au moins 8 caractères.", ["password"]);
	}

	if (!Checkers.isPasswordSafe([password1, password2])) {
		return new ModelError(400, "Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule, un nombre et un caractère spécial.", ["password"]);
	}

	if (password1 !== password2) {
		return new ModelError(400, "Les mots de passe ne correspondent pas.", ["password"]);
	}

	// Check if something is not available
	if (!await isEmailAvailable(db, email)) {
		return new ModelError(400, "Cette adresse e-mail est déjà utilisée.", ["email"]);
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
 * @async
 * @function addStaff
 * @description Add a staff member. His password is sent to the given email address.
 *
 * @param {Promise<void>} db - Database connection
 * @param {string} first_name - User first name
 * @param {string} [last_name] - User last name
 * @param {string} email - User email address
 * @param {Number|string} role_id - His role ID
 * @returns {Promise<{code: Number, message: string}|ModelError>} A confirmation message or a ModelError
 *
 * @example
 * 	User.addStaff(db, "Daft", "Punk", "daft.punk@elect.ro", "cook")
 */
const addStaff = async (db, first_name, last_name, email, role_id) => {
	// Check if something is invalid
	if (!Checkers.strInRange(first_name, null, 255)) {
		return new ModelError(400, "Vous devez fournir un prénom valide. (max. 255 caractères).", ["first_name"]);
	}

	if (!Checkers.strInRange(last_name, null, 255, true, true)) {
		return new ModelError(400, "Vous devez fournir un nom valide. (max. 255 caractères).", ["last_name"]);
	}

	if (!Checkers.isEmail(email)) {
		return new ModelError(400, "Vous devez fournir une adresse e-mail valide.", ["email"]);
	}

	// Check if something is not available
	if (!await isEmailAvailable(db, email)) {
		return new ModelError(400, "Cette adresse e-mail est déjà utilisée.", ["email"]);
	}

	if (!await isRoleIDValid(db, role_id)) {
		return new ModelError(400, "Le rôle sélectionné n'existe pas.", ["role"]);
	}

	// Create password
	const password = generatePwd.generate({ length: 8, numbers: true, symbols: true, excludeSimilarCharacters: true, strict: true });
	const hashedPwd = await hashPassword(password);

	// Add the staff
	await db.query(`
    INSERT INTO users(role_id, first_name, last_name, email, password)
    VALUES (?, ?, ?, ?, ?)
    `, [role_id, first_name, last_name ? last_name : null, email, hashedPwd]
	);

	// Return the password
	try {
		await Mail.sendPassword(email, password);
		return { code: 202, message: "Staff added." };
	} catch (err) {
		return new ModelError(500, "Impossible d'envoyer le mot de passe à l'adresse e-mail du nouvel employé.");
	}
};

/* ---- READ ------------------------------------ */
/**
 * @async
 * @function login
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
		return new ModelError(400, "Vous devez fournir une adresse e-mail valide.", ["email"]);
	}

	if (!Checkers.strInRange(password, 8, null)) {
		return new ModelError(400, "Le mot de passe doit contenir au moins 8 caractères.", ["password"]);
	}

	let user = await getPwdByEmail(db, email);
	if (user instanceof ModelError) return user;

	// Check the role
	if (roleLevel) {
		const role = await Role.getByName(db, roleLevel);
		if (role instanceof ModelError) return role;

		if (user.role !== roleLevel) {
			return new ModelError(401, "Vous n'avez pas les droits nécessaires pour accéder à cette page.");
		}
	}

	const canConnect = user ? await doesPasswordMatchHash(password, user.password) : false;

	if (!canConnect) {
		return new ModelError(400, "Aucun utilisateur n'a été trouvé avec cette adresse e-mail et ce mot de passe.", ["email", "password"]);
	} else {
		delete user.password;
		return user;
	}
};

/**
 * @async
 * @function loginWithToken
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
		return new ModelError(400, "Vous devez fournir un token valide.", ["token"]);
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
			return new ModelError(401, "Vous n'avez pas les droits nécessaires pour accéder à cette page.");
		}
	}

	return user;
};

/**
 * @async
 * @function getStaff
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
      roles.display_name AS "display_role",
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
 * @async
 * @function getPwdByEmail
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
      roles.display_name AS "display_role",
      users.first_name,
      users.last_name,
      users.email,
      users.password
    FROM users
    LEFT JOIN roles ON users.role_id = roles.role_id
    WHERE users.email = ?
  `, [email]);

	return user[0] ? user[0] : new ModelError(404, `Aucun utilisateur n'a été trouvé avec l'adresse e-mail "${email}"`);
};

/**
 * @async
 * @function getByEmail
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
		return new ModelError(400, "Vous devez fournir une adresse e-mail valide.", ["email"]);
	}

	const user =  db.query(`
    SELECT
      users.user_id,
      roles.role_id,
      roles.name AS "role",
      roles.display_name AS "display_role",
      users.first_name,
      users.last_name,
      users.email
    FROM users
    LEFT JOIN roles ON users.role_id = roles.role_id
    WHERE users.email = ?
  `, [email]);

	return user[0] ? user[0] : new ModelError(404, `Aucun utilisateur n'a été trouvé avec l'adresse e-mail "${email}"`);
};

/**
 * @async
 * @function getById
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
      roles.display_name AS "display_role",
      users.first_name,
      users.last_name,
      users.email
    FROM users
    LEFT JOIN roles ON users.role_id = roles.role_id
    WHERE users.user_id = ?
    LIMIT 1
  `, [user_id]);

	return user[0] ? user[0] : new ModelError(404, `Aucun utilisateur n'a été trouvé avec l'ID utilisateur "${user_id}"`);
};

/* ---- UPDATE ---------------------------------- */
/**
 * @async
 * @function update
 * @description Update a user using its ID
 * @see {@link module:models/Role}
 *
 * @param {Promise<void>} db - Database connection
 * @param {Number|string} user_id - User ID
 * @param {Number} [role_id] - ID of its role
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
		return new ModelError(400, "Vous devez fournir un prénom valide. (max. 255 caractères).", ["first_name"]);
	}

	if (!Checkers.strInRange(last_name, null, 255, true, true)) {
		return new ModelError(400, "Vous devez fournir un nom valide. (max. 255 caractères).", ["last_name"]);
	}

	if (!await isRoleIDValid(db, role_id)) {
		return new ModelError(400, "Le rôle sélectionné n'existe pas.", ["role"]);
	}

	const updatingFields = getFieldsToUpdate({ role_id, first_name, last_name, email });
	if (!updatingFields) return new ModelError(200, "Nothing to update");

	return db.query(`UPDATE users SET ${updatingFields} WHERE user_id = ?`, [user_id]);
};

/* ---- DELETE ---------------------------------- */
/**
 * @async
 * @function deleteStaff
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