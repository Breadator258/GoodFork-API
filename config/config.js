const config = {
	app: {
		port: 8080,
		security: {
			saltRound: 10
		}
	},
	db: {
		host: "3.134.79.46",
		port: 3306,
		dbname: "goodfork_db",
		user: "goodfork",
		password: "Is This A S4lad?!",
		connectionLimit: 5
	},
	api: {
		prefix: "/api"
	}
};

export default config;