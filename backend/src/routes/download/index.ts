import express from 'express';
import DownloadRoutes from "./routes/download.routes";

const router = express.Router();

router.use(DownloadRoutes);

export default router;