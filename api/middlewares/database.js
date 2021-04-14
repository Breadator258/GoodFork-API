import mariadb from "mariadb";
import config from "../../config/config.js";

const pool = mariadb.createPool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.dbname,
  user: config.db.user,
  password: config.db.password,
  connectionLimit: config.db.connectionLimit
});

const database = async (request, response, next) => {
  request.database = pool;
  next();
}

export default database;