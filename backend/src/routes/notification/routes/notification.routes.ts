import express from "express";
import requireUser from "../../../middleware/requireUser";
import * as Controller from '../../../controller/notification.controller';

const router = express.Router();

router.get("/", requireUser, Controller.getUserNotificationsHandler)

export default router;