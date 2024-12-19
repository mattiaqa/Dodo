import express from 'express';
import ManageRoutes from './routes/manage.routes';

const router = express.Router();

router.use(ManageRoutes);

export default router;