import express from 'express';
import * as Controller from '../../../controller/bid.controller';
import requireUser from '../../../middleware/requireUser';
import validateResource from '../../../middleware/validateResource';
import { placeBidSchema, getBidsSchema } from '../../../schema/bid.schema';

const router = express.Router();

router.use(requireUser);
router.post('/bid', validateResource(placeBidSchema), Controller.placeBidHandler);
router.get('/:auctionId/bid', Controller.getBidsHandler);

export default router;