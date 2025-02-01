import express from "express";
import requireAdmin from "../../../middleware/requireAdmin";
import * as Controller from '../../../controller/statistic.controller';

const router = express.Router();

router.get("/totalAuctions", requireAdmin, Controller.totalAuctions);
router.get("/", requireAdmin, Controller.allStatistics);

export default router;