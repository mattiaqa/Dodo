import express from 'express';
import Bidroutes from './routes/bid.routes';
import Manageroutes from './routes/manage.routes';
import Commentroutes from './routes/comment.routes';
import Inforoutes from './routes/info.routes';

const router = express.Router();

router.use(Inforoutes);

//uses RequireUser
router.use(Bidroutes);
router.use(Manageroutes);
router.use(Commentroutes);

export default router;