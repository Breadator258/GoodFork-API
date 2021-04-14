const config = {
  app: {
    port: 8164,
    security: {
      saltRound: 10
    }
  },
  api: {
    prefix: "/"
  },
  db: {
    host: "3.134.79.46",
    port: 3306,
    dbname: "goodfork_db",
    user: "goodfork",
    password: "Is This A S4lad?!",
    connectionLimit: 5
  }
}

export default config;