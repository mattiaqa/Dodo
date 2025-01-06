import express from "express";
import NotificationRoutes from "./routes/notification.routes";

const router = express.Router();

router.use(NotificationRoutes)