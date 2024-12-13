import express from 'express';
import config from 'config';
import connect_db from './utils/mongodb';
import logger from './utils/logger';
import routes from './routes';
import cors from 'cors';
import deserializeUser from './middleware/deserializeUser';
import sgMail from '@sendgrid/mail';

const port = config.get<number>('port');

const app = express();

app.use(express.json());
app.use(cors());

app.use(deserializeUser);

app.use('/public/uploads', express.static('uploads'));

app.listen(port, () => {
    logger.info(`App is running at http://localhost:${port}`);

    connect_db();

    routes(app);
});

// Imposta la chiave API di SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string); // Assicurati che SENDGRID_API_KEY sia definito
