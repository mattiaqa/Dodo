import express from 'express';
import Bidroutes from './routes/bid.routes';
import Manageroutes from './routes/manage.routes';
import Commentroutes from './routes/comment.routes';
import Inforoutes from './routes/info.routes';

const router = express.Router();

router.use(Bidroutes);
router.use(Manageroutes);
router.use(Commentroutes);
router.use(Inforoutes);

export default router;