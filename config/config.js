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
		refreshToken: "1//044cpHSzgcwGrCgYIARAAGAQSNwF-L9IrQhZmY9YkHJQxWPCaAKxMKaSj2x3MEM3UkHIPGpN658KRueQQwV_vIpc3adoMRg4w29I"
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