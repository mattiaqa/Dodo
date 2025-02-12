import express from 'express';
import * as Controller from '../../../controller/bid.controller';
import requireUser from '../../../middleware/requireUser';
import * as Validator from '../../../middleware/validateResource';
import { placeBidSchema, getBidsSchema } from '../../../schema/bid.schema';

const router = express.Router();

router.post('/:auctionId/bid', requireUser, Validator.validateParams(getBidsSchema), Validator.validateBody(placeBidSchema), Controller.placeBidHandler);
router.get('/:auctionId/bid', requireUser, Validator.validateParams(getBidsSchema), Controller.getBidsHandler);

export default router;