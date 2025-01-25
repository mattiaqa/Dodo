import { setInRedis } from '../utils/redis'
import logger from '../utils/logger';
import {getWinner} from "../service/bid.service";
import {getAuctionById, setWinner} from "../service/auction.service";
import {notifyUser} from "../service/notification.service";

export interface Task {
    task_id: string;
    auctionId: string;
    expiration: Date
}

export class Scheduler {
    private async closeAuction(auctionId: string): Promise<void> {
        const winner = await getWinner({auctionId: auctionId});
        //FIXME: const auction = await searchAuctionById(auctionId);

        if(!winner) {
            //send email
            return;
        }

        await setWinner(winner);

        await notifyUser({
            userId: winner.buyer,
            title: "🎉 Congratulations! You've Won the Auction!",
            text: `Great news! You've just won the auction for }! 🏆\n` +
                "Please proceed to complete your payment and finalize the transaction."
        });

        logger.info('Finished notification process');
    }

    async runScheduler(key: string) {
        const auctionId = key.split(':')[1]
        if(!auctionId) {
            logger.error(`No task with id ${key}`);
        } else {
            logger.info('Closing auction ' + auctionId);
            await this.closeAuction(auctionId);
        }
    }

    async scheduleTask(task: Task) {
        const redisKey = `${task.task_id}`;
        const ttl = Math.max(0, Math.floor((new Date(task.expiration).getTime() - Date.now()) / 1000));

        if (ttl > 0) {
            await setInRedis(redisKey, task, ttl);
            logger.info(`Scheduled task ${task.task_id} with TTL of ${ttl} seconds`);
        } else {
            logger.error(`Cannot schedule task ${task.task_id}, expiration time is in the past`);
        }
    }
}

export const scheduler = new Scheduler();