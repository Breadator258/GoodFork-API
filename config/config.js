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
	},
	oauth2: {
		clientId: "571942492534-gc8fi36bqt6ojl2uf91ghiirsqcode0k.apps.googleusercontent.com",
		clientSecret: "qqlpt7wyQa5ZvEmrXbBZrsnA",
		refreshToken: "1//04l38gnSaGb9TCgYIARAAGAQSNwF-L9IrGSeluw8KgVkKdAOJXjkPswH-GAaErgOEuEB4NE2CytEZsEBj5a3onXivBk5v9I99oyg"
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