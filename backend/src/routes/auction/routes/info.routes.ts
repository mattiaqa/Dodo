import express from 'express';
import * as AuctionController from '../../../controller/auction.controller';
import { searchAuctionSchema } from '../../../schema/auction.schema';
import { validateQuery } from '../../../middleware/validateResource';

const router = express.Router();

router.get('/', validateQuery(searchAuctionSchema), AuctionController.getAllAuctionHandler);
router.get('/:auctionId', AuctionController.getAuctionHandler);

export default router;