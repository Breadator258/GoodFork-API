/**
 * @namespace
 * @property {Object} app - App configuration
 * @property {Number} app.port - HTTP port
 * @property {Object} app.https - HTTPS configuration
 * @property {Number} app.https.port - HTTPS port
 * @property {Number} app.https.passphrase - HTTPS certificate passphrase
 * @property {Object} app.security - Security configuration
 * @property {Number} app.security.saltRound - Salt rounds used in password protection
 * @property {Object} db - DB configuration
 * @property {string} db.host - Host
 * @property {Number} db.port - Port
 * @property {string} db.dbname - Database name
 * @property {string} db.user - User
 * @property {string} db.password - Password
 * @property {string} db.connectionLimit - How much simultaneously connections are permitted
 * @property {Object} api - API Configuration
 * @property {string} api.prefix - Prefix for all APIs routes
 * @property {Object} oauth2 - OAuth2 Configuration
 * @property {string} oauth2.clientId - Client ID
 * @property {string} oauth2.clientSecret - Client secret
 * @property {string} oauth2.refreshToken - Refresh token
 * @property {Object} email - E-Mail Configuration
 * @property {string} email.service - Mail provider
 * @property {string} email.host - SMTP server
 * @property {Number} email.port - Server port
 * @property {string} email.address - Email address
 * @property {string} email.password - Email address password
 */
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
		refreshToken: "1//04lO9UrMdPJRICgYIARAAGAQSNwF-L9IrBCtRtokb2jQ_-R3yiY4fNgPuPCflxhv5KR58qB_7DQka7vYyjhW0jKNA5ZKqLfXnuDs"
	},
	email: {
		service: "gmail",
		host: "smtp.gmail.com",
		port: 465,
		address: "noreply.goodfork@gmail.com",
		password: "Is This A S4lad?!"
	}
};

export default config;