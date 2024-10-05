import mongoose from 'mongoose';
import config from 'config';
import logger from './logger';

async function connect_db() {
    const db_url = config.get<string>('db_url');

    try {
        await mongoose.connect(db_url);
        logger.info('Connected to mongoDB')
    } catch (error) {
        logger.error('Unable to connect to mongoDB');
        process.exit(1);
    }
}

export default connect_db;