import mongoose from 'mongoose';
import config from 'config';
import logger from '../utils/logger';

async function connect_db() {
    const db_url = config.get<string>('db_url');

    try {
        await mongoose.connect(db_url);
        logger.info('Connected to mongoDB from listener');
    } catch (error: any) {
        logger.error(`Unable to connect to mongoDB: ${error.message}`);
        process.exit(1);
    }
}

export default connect_db;