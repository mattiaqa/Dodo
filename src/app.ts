import express from 'express';
import config from 'config';
import connect_db from './utils/connect';
import logger from './utils/logger';
import routes from './routes';

const port = config.get<number>('port');

const app = express();

app.listen(port, () => {
    logger.info(`App is running at http://localhost:${port}`);

    connect_db();

    routes(app);
});