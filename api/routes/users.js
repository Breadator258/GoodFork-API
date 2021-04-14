import bcrypt from "bcrypt";
import middlewares from "../middlewares/index.js";
import config from "../../config/config.js";

// TODO: Set headers
const ROUTE = "/users";
const DEV_ROUTE = "/users/dev";

export default (router) => {
  // TODO - WARNING: Remove this route. Only used for development.
  router.get(DEV_ROUTE, middlewares.database, async (request, response) => {
    let conn;

    try {
      conn = await request.database.getConnection();
      const users = await conn.query(`
        SELECT
            users.user_id,
            roles.name AS "role",
            users.email
        FROM users
        LEFT JOIN roles ON users.role_id = roles.role_id
      `);

      response.json(users).status(200).end();
    } catch (err) {
      throw err;
    } finally {
      if (conn) await conn.end();
    }
  });

  // Find user by email
  router.get(ROUTE, middlewares.database, async (request, response) => {
    const { email } = request.query;

    if (!checkEmail(email)) {
      return response
        .status(400)
        .send("Missing or invalid email parameter in query.")
        .end();
    }

    let conn;

    try {
      conn = await request.database.getConnection();
      const user = await conn.query(`
        SELECT
          users.user_id,
          roles.name AS "role",
          users.email
        FROM users
        LEFT JOIN roles ON users.role_id = roles.role_id
        WHERE users.email = ?
      `, [email]);

      response.json(user).status(200).end()
    } catch (err) {
      response.status(500).end();
      throw err;
    } finally {
      if (conn) conn.end().catch(console.error);
    }
  });

  // Add user
  router.post(ROUTE, middlewares.database, async (request, response) => {
    const { email, password, passwordConfirm } = request.body;

    // Check if every field are filled.
    if (!checkEmail(email) || !checkPassword(password) || !checkPassword(passwordConfirm)) {
      return response
        .status(400)
        .send(`Missing or invalid parameter(s) in body. Require "email", "password" and "passwordConfirm".`)
        .end();
    }

    // Check if the two passwords are identical
    if (!checkPasswordsPair(password, passwordConfirm)) {
      return response
        .status(400)
        .send(`The passwords doesn't match.`)
        .end();
    }

    // Check if the email is available
    if (!await checkEmailAvailability(email, request.database)) {
      return response
        .status(400)
        .send(`The email is already taken.`)
        .end();
    }

    let conn;

    const hashedPwd = await bcrypt.hash(password, config.app.security.saltRound);

    try {
      conn = await request.database.getConnection();
      await conn.query(`
        INSERT INTO users(email, password)
        VALUES (?, ?)
      `, [email, hashedPwd]);

      response.status(202).end()
    } catch (err) {
      response.status(500).end();
      throw err;
    } finally {
      if (conn) conn.end().catch(console.error);
    }
  });
};

function checkEmail(email, db = null) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function checkEmailAvailability(email, db) {
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

function checkPassword(password) {
  return password !== undefined && `${password}`.length > 0;
}

function checkPasswordsPair(password1, password2) {
  return password1 === password2;
}