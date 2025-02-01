import {Request, Response} from "express";
import logger from "../utils/logger";
import {getUserNotifications, readNotificationById} from "../service/notification.service";

/**
 * Handler to retrieve unread notifications for a specific user.
 *
 * Process:
 * - Retrieves the user's ID from the authenticated session (res.locals.user).
 * - Fetches unread notifications for the user from the database.
 * - If no notifications are found, returns a 404 error with the message "Notification not found".
 * - Otherwise, returns the list of unread notifications.
 * - If an error occurs while fetching notifications, a 500 internal server error is returned.
 */
export async function getUserNotificationsHandler(req: Request, res: Response) {
    const userId = res.locals.user!.id;

    try {
        const notifications = await getUserNotifications({ userId: userId, read: false });

        if (!notifications) {
            res.status(404).send("Notification not found");
        }

        res.send(notifications);
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({ message: "Internal Server Error" });
    }
}

/**
 * Handler to mark a specific notification as read.
 *
 * Process:
 * - Retrieves the user's ID from the authenticated session (res.locals.user).
 * - Checks if the provided notification ID exists in the user's notifications.
 * - If the notification is not found, returns a 404 error with the message "Notification not found".
 * - Marks the specified notification as read in the database.
 * - If successful, returns a success message indicating the notification was read.
 * - If an error occurs while processing, a 500 internal server error is returned.
 */
export async function readNotificationsHandler(req: Request, res: Response) {
    const userId = res.locals.user!.id;
    const notificationId = req.body.notificationId;

    try {
        const notification = await getUserNotifications({ userId: userId, _id: notificationId });

        if (!notification) {
            res.status(404).send({ "Error": "Notification not found" });
        }

        await readNotificationById(notificationId);

        res.status(200).send({ "Message": "Notification read successfully" });
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({ message: "Internal Server Error" });
    }
}