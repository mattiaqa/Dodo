import express from 'express';
import config from 'config';
import connect_db from './utils/mongodb';
import logger from './utils/logger';
import routes from './routes';
import cors, {CorsOptions} from 'cors';
import deserializeUser from './middleware/deserializeUser';
import cookieParser from 'cookie-parser';

const port = config.get<number>('port');
const app = express();
export let globalOAuth2Client: any;

app.use(express.json());
app.use(cookieParser());

const corsOptions: CorsOptions = {
    origin: 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}

app.use(cors(corsOptions));

app.use(deserializeUser);

app.use('/public/uploads', express.static('uploads'));

app.listen(port, () => {
    logger.info(`App is running at http://localhost:${port}`);
    connect_db();
    routes(app);
});