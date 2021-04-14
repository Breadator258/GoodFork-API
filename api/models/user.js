import bcrypt from "bcrypt";
import config from "../../config/config.js";

// TODO: Make a class

/***********************************************************
 * Login / register
 ***********************************************************/
export async function register(db, email, password, passwordConfirm) {
  // Check if every field are filled.
  if (!checkEmail(email) || !checkPassword(password) || !checkPassword(passwordConfirm)) {
    return {
      code: 400,
      error: {
        message: `Missing or invalid parameter(s) in body. Require "email", "password" and "passwordConfirm".`
      }
    };
  }

  // Check if the two passwords are identical
  if (!checkPasswordsPair(password, passwordConfirm)) {
    return { code: 400, error: { message: "The passwords doesn't match." } };
  }

  // Check if the email is available
  if (!await checkEmailAvailability(email, db)) {
    return { code: 400, error: { message: "The email is already taken." } };
  }

  let conn;
  let response;
  const hashedPwd = await hashPassword(password);

  try {
    conn = await db.getConnection();
    await conn.query(`
        INSERT INTO users(email, password)
        VALUES (?, ?)
      `, [email, hashedPwd]);

    response = { code: 202 };
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.end().catch(console.error);
  }

  return response;
}


/***********************************************************
 * Email
 ***********************************************************/
export async function findByEmail(db, email) {
  if (!checkEmail(email)) {
    return { code: 400, error: { message: "Missing or invalid email parameter in query." } };
  }

  let conn;
  let response;

  try {
    conn = await db.getConnection();
    const user = await conn.query(`
        SELECT
          users.user_id,
          roles.name AS "role",
          users.email
        FROM users
        LEFT JOIN roles ON users.role_id = roles.role_id
        WHERE users.email = ?
      `, [email]);

    response = { code: 200, data: user };
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.end().catch(console.error);
  }

  return response;
}

export function checkEmail(email, db = null) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function checkEmailAvailability(email, db) {
  let conn;

  try {
    conn = await db.getConnection();
    const user = await db.query("SELECT email FROM users WHERE email = ?", [email]);

    return user.length === 0;
  }
  catch (err) { throw err; }
  finally { if (conn) conn.end().catch(console.error); }

  return false;
}

/***********************************************************
 * Password
 ***********************************************************/
export function checkPassword(password) {
  return password !== undefined && `${password}`.length > 0;
}

export function checkPasswordsPair(password1, password2) {
  return password1 === password2;
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, config.app.security.saltRound);
}

export function comparePassword(email, password) {

}