import { createClient } from "redis"
import logger from './logger';
import config from "config";

export const redisClient = async () => {
    const redis_url = config.get<string>('redis_url');
    const client = createClient({url: redis_url})
        .on('error', (err) => { logger.error(err); })
        .on('connect', () => { logger.info('Connected to Redis') })
        .on('ready', () => { logger.info('Redis is ready') });

    await client.connect();
    return client;
}

export const getFromRedis = async <T = { [key: string]: any }>(key: string): Promise<T | null> => {
    const client = await redisClient();
    try {
        const value = await client.get(key);
        console.log(key);
        return value ? JSON.parse(value) as T : null;
    } catch (error) {
        logger.error(`Error getting key "${key}" from Redis: ${error}`);
        return null;
    } finally {
        await client.disconnect();
    }
};

export const setInRedis = async (key: string, value: any, expireIn?: number): Promise<void> => {
    const client = await redisClient();
    try {
        const stringValue = JSON.stringify(value);
        await client.set(key, stringValue);
        if (expireIn) {
            await client.expire(key, expireIn);
        }
        logger.info(`Key "${key}" set in Redis${expireIn ? ` with TTL of ${expireIn}s` : ''}`);
    } catch (error) {
        logger.error(`Error setting key "${key}" to Redis: ${error}`);
    } finally {
        await client.disconnect();
    }
};