import {FilterQuery} from "mongoose";
import logger from "../utils/logger";
import NotificationModel, {NotificationDocument, NotificationInput} from "../models/notification.model";

export async function notifyUser(notification: NotificationInput): Promise<NotificationDocument | undefined> {
    try {
        const newNotification = await NotificationModel.create(notification);

        return newNotification.toJSON();
    } catch (e:any) {
        logger.error(e);
    }
}

export async function getUserNotifications(query: FilterQuery<NotificationDocument>) {
    try {
        return NotificationModel.find(query);
    } catch (e: any) {
        logger.error(e);
    }
}