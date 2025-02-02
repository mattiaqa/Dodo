import mongoose from 'mongoose';
import config from 'config';
import logger from './logger';
import StatisticModel from "../models/statistic.model";

async function connect_db() {
    const db_url = config.get<string>('db_url');

    try {
        await mongoose.connect(db_url);

        // Create statistics document if it doesn't exist
        await StatisticModel.findOneAndUpdate(
            { statisticId: "singleton" },
            {
                $setOnInsert: {  // Only set these values on insert
                    successfullyClosed: 0,
                    unsuccessfullyClosed: 0,
                    auctionsRemoved: 0,
                    auctionsEdited: 0,
                }
            },
            {
                upsert: true,                 // Create if doesn't exist
                new: true,                    // Return the modified document
                setDefaultsOnInsert: true     // Apply schema defaults
            }
        );

        logger.info('Connected to mongoDB');
    } catch (error: any) {
        logger.error(`Unable to connect to mongoDB: ${error.message}`);
        process.exit(1);
    }
}

export default connect_db;