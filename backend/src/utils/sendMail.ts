import { google } from "googleapis";
import nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";
import ejs from 'ejs';

// Percorso al file JSON delle credenziali
/*const CREDENTIALS_PATH = path.resolve(__dirname, "../../gmailAPI/credentials.json");
const TOKEN_PATH = path.resolve(__dirname, "../../gmailAPI/token.json");
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));*/

// Le credenziali dovrebbero provenire da variabili di ambiente per maggiore sicurezza.
const CLIENT_ID = process.env.GMAIL_API_CLIENT_ID;// || credentials.web.client_id;
const CLIENT_SECRET = process.env.GMAIL_API_CLIENT_SECRET// || credentials.web.client_secret;
const REDIRECT_URI = process.env.GMAIL_API_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GMAIL_API_REFRESH_TOKEN;// || token.refresh_token;

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

export const sendEmail = async (recipient: string, subject: string, body: any) => {
    try{
        oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});
        
        const accessToken = await oAuth2Client.getAccessToken();
        if (!accessToken.token) {
            throw new Error('An error occured during the generation of the Gmail API access token');
        }

        // Configura il trasportatore
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'info.dodoreads@gmail.com', // Inserisci l'email autorizzata
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });
        // Opzioni per l'email
        const mailOptions = {
            from: 'The DodoReads Team <info.dodoreads@gmail.com>', // Email mittente
            to: recipient, // Email destinatario
            subject: subject,
            text: 'If you are reading this text, an error occured loading this page.\
                Try reloading the page or using another email viewer',
            html: body,
        };

        // Invia l'email
        const result = await transport.sendMail(mailOptions);
        console.log('Email sent successfully: ', result);
        return;
    } 
    catch (error) {
        console.error('An error occured during the email sending process:', error);
        return;
    }
};

export async function renderEmail(template: string, data: any)
{
    const templatePath = path.join(__dirname, '../../gmailAPI/templates', template, 'email.ejs');
    const res = await ejs.renderFile(templatePath, data);
    return res;
}