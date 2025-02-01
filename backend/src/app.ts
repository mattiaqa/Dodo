import express, { NextFunction, Request, Response } from 'express';
import config from 'config';
import connect_db from './utils/mongodb';
import logger from './utils/logger';
import routes from './routes';
import cors, {CorsOptions} from 'cors';
import deserializeUser from './middleware/deserializeUser';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { uploadAuctionImages } from './utils/multer';

const port = config.get<number>('port');
const app = express();
export let globalOAuth2Client: any;

app.use(express.json());
app.use(cookieParser());

const corsOptions: CorsOptions = {
    origin: 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-xsrf-token']
}

app.use(cors(corsOptions));

app.use(deserializeUser);

app.use('/public/uploads', express.static('uploads'));

app.use((err:any, req:any, res:any, next:any) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Max size is 1MB.' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
});

app.listen(port, () => {
    logger.info(`App is running at http://localhost:${port}`);
    connect_db();
    routes(app);
});