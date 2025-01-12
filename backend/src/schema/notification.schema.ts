import { object, string, TypeOf } from "zod";

export const readNotificationSchema = object({
    notificationId: string({required_error: "notificationId is required"})
});

export type ReadNotificationInput = TypeOf<typeof readNotificationSchema>;