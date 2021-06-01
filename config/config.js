const config = {
	app: {
		port: 8080,
		https: {
			port: 8443,
			passphrase: "Is This A S4lad?!"
		},
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
	},
	oauth2: {
		clientId: "571942492534-gc8fi36bqt6ojl2uf91ghiirsqcode0k.apps.googleusercontent.com",
		clientSecret: "qqlpt7wyQa5ZvEmrXbBZrsnA",
		refreshToken: "1//04itZYBkmsazcCgYIARAAGAQSNwF-L9IrRYxU-rm1-8Dd_CLrVzMrrqzZ-84UgNBdxkOoWDaHXNrUQJLsDtwvjT89uJ3y6vcWIzU"
	},
	email: {
		service: "gmail",
		host: "smtp.gmail.com",
		port: "465",
		address: "noreply.goodfork@gmail.com",
		password: "Is This A S4lad?!"
	}
};

export default config;