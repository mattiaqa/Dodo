import express from "express";
import requireUser from "../../../middleware/requireUser";
import * as Controller from '../../../controller/notification.controller';
import * as Validator from "../../../middleware/validateResource";
import {readNotificationSchema} from "../../../schema/notification.schema";

const router = express.Router();

router.get("/", requireUser, Controller.getUserNotificationsHandler);
router.post("/read", [requireUser, Validator.validateBody(readNotificationSchema)], Controller.readNotificationsHandler);
export default router;