import express from "express";
import statisticRoutes from "./routes/statistic.routes";

const router = express.Router();

router.use(statisticRoutes)