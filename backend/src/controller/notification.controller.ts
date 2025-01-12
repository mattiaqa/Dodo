import {Request, Response} from "express";
import logger from "../utils/logger";
import {getUserNotifications, readNotificationById} from "../service/notification.service";

export async function getUserNotificationsHandler(req: Request, res: Response) {
    const userId = res.locals.user!._id;

    try {
        const notifications = await getUserNotifications({userId: userId, read: false});

        if(!notifications) {
            res.status(404).send("Notification not found");
        }

        res.send(notifications);
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

export async function readNotificationsHandler(req: Request, res: Response) {
    const userId = res.locals.user!._id;
    const notificationId = req.body.notificationId;

    try {
        const notification = await getUserNotifications({userId: userId, _id: notificationId});

        if(!notification) {
            res.status(404).send("Notification not found");
        }

        await readNotificationById(notificationId);

        res.sendStatus(200);
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}