import bcrypt from "bcrypt";
import middlewares from "../middlewares/index.js";
import config from "../../config/config.js";
import * as User from "../models/user.js";

// TODO: Set headers
const ROUTE = "/users";
const DEV_ROUTE = "/users/dev";

export default (router) => {
  /***********************************************************
   * GET
   ***********************************************************/
  // Find by email
  router.get(ROUTE, middlewares.database, async (request, response) => {
    const { email } = request.query;
    let result;

    // Find user
    try {
      result = await User.findByEmail(request.database, email);
    } catch (err) {
      response.status(500).end();
    }

    // Check for error
    if (result.hasOwnProperty("error")) {
      return response
        .status(result.code || 500)
        .send(result.error.message || null)
        .end();
    }

    // No error, return results
    response.status(result.code)
      .json(result.data)
      .end();
  });

  /***********************************************************
   * ADD
   ***********************************************************/
  // Add user
  router.post(ROUTE, middlewares.database, async (request, response) => {
    const { email, password, passwordConfirm } = request.body;
    let result;

    // Add user
    try {
      result = await User.register(request.database, email, password, passwordConfirm);
    } catch (err) {
      response.status(500).end();
    }

    // Check for error
    if (result.hasOwnProperty("error")) {
      return response
        .status(result.code || 500)
        .send(result.error.message || null)
        .end();
    }

    // No error, return results
    response.status(result.code)
      .json(result.data)
      .end();
  });
};