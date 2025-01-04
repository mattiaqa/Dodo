import {Request, Response} from "express";
import logger from "../utils/logger";
import {getUserNotifications} from "../service/notification.service";

export async function getUserNotificationsHandler(req: Request, res: Response) {
    const userId = res.locals.user._id;

    try {
        const notifications = await getUserNotifications({userId: userId});
        if(!notifications) {
            res.status(404).send("Notification not found");
        }

        res.send(notifications);
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}