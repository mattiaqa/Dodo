import { redisClient } from '../utils/redis';
import { scheduler } from './scheduler';
import logger from '../utils/logger';
import connect_db from "./connection";

(async () => {
    const client = await redisClient();

    await client.configSet('notify-keyspace-events', 'Ex');
    await connect_db();
    const sub = client.duplicate();
    await sub.connect();
    const expired_subKey = '__keyevent@0__:expired';

    await sub.pSubscribe(expired_subKey, async (key) => {
        await scheduler.runScheduler(key);
    });

    logger.info("Redis listener set up and waiting for events...")
})();