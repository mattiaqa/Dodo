import { setInRedis } from './redis'
import logger from './logger';
import {getWinner} from "../service/bid.service";
import {setWinner} from "../service/auction.service";

export interface Task {
    task_id: string;
    auctionId: string;
    expiration: Date
}

export class Scheduler {
    private async closeAuction(auctionId: string): Promise<void> {
        const winner = await getWinner(auctionId);

        if(!winner) {
            //send email
            return;
        }

        await setWinner(winner);

        // send email
    }

    async runScheduler(key: string) {
        const auctionId = key.split(':')[1]

        if(!auctionId) {
            logger.error(`No task with id ${key}`);
        } else {
            await this.closeAuction(auctionId);
        }
    }

    async scheduleTask(task: Task) {
        const redisKey = `${task.task_id}`;
        const ttl = Math.max(0, Math.floor((new Date(task.expiration).getTime() - Date.now()) / 1000));

        await setInRedis(redisKey, task);

        if (ttl > 0) {
            await setInRedis(redisKey, task, ttl);
            logger.info(`Scheduled task ${task.task_id} with TTL of ${ttl} seconds`);
        } else {
            logger.error(`Cannot schedule task ${task.task_id}, expiration time is in the past`);
        }
    }
}

export const scheduler = new Scheduler();