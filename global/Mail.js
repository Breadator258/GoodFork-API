/**
 * @module Mail
 * @description This module is used to send mail.
 */
import nodemailer from "nodemailer";
import { google } from "googleapis";
import config from "../config/config.js";

/* ---- Configure ------------------------------- */
const { oauth2, email } = config;

/* -- OAuth2 */
const OAuth2Client = new google.auth.OAuth2(oauth2.clientId, oauth2.clientSecret);
OAuth2Client.setCredentials({ refresh_token: oauth2.refreshToken });

const accessToken = OAuth2Client.getAccessToken();

/* -- Nodemailer */
const transporter = nodemailer.createTransport({
	service: email.service,
	auth: {
		type: "OAuth2",
		user: email.address,
		clientId: oauth2.clientId,
		clientSecret: oauth2.clientSecret,
		refreshToken: oauth2.refreshToken,
		accessToken: accessToken
	},
	tls: { rejectUnauthorized: false }
});

transporter.verify()
	.then(() => console.log("Ready to send email."))
	.catch(err => console.error(err));

/* ---- Pre-defined emails ---------------------- */
/**
 * @function sendPassword
 * @description Send a generated password to a new member
 *
 * @param {string} targetEmail - The new member email address
 * @param {string} password - His generated password
 *
 * @example
 * 	Mail.sendPassword("rick.astley@nggyu.co.uk", "pa$$w0rd!")
 */
function sendPassword(targetEmail, password) {
	const mailContent = {
		from: email.address,
		to: targetEmail,
		subject: "The Good Fork - Bienvenue dans l'équipe !",
		text: `Vous pouvez dès à présent vous connecter sur l'application The Good Fork avec les identifiants suivants :\n
		Identifiant : ${targetEmail}\n
		Mot de passe: ${password}\n\n
		N'oubliez pas de changer le mot de passe après votre première connexion.`,
		html: `<p>Vous pouvez dès à présent vous connecter sur l'application The Good Fork avec les identifiants suivants :</p>
		<ul>
			<li>Identifiant : ${targetEmail}</li>
			<li>Mot de passe: ${password}</li>
		</ul>
		<p>N'oubliez pas de changer le mot de passe après votre première connexion.</p>`
	};

	return transporter.sendMail(mailContent);
}

/* ---- Export ---------------------------------- */
const Mail = { sendPassword };
export default Mail;