import { redisClient } from './redis';
import { scheduler } from './scheduler';
import logger from './logger';

(async () => {
    const client = await redisClient();

    await client.configSet('notify-keyspace-events', 'Ex');

    const sub = client.duplicate();
    await sub.connect();
    const expired_subKey = '__keyevent@0__:expired';

    await sub.pSubscribe(expired_subKey, async (key) => {
        await scheduler.runScheduler(key);
    });

    logger.info("Redis listener set up and waiting for events...")
})();