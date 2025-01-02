import express from 'express';
import * as Controller from '../../../controller/bid.controller';
import requireUser from '../../../middleware/requireUser';
import validateResource from '../../../middleware/validateResource';
import { placeBidSchema, getBidsSchema } from '../../../schema/bid.schema';

const router = express.Router();

router.post('/bid', [validateResource(placeBidSchema), requireUser], Controller.placeBidHandler);
router.get('/bid', [validateResource(getBidsSchema), requireUser], Controller.getBidsHandler);

export default router;