import express from 'express';
import * as AuctionController from '../../../controller/auction.controller';
import { searchAuctionSchema } from '../../../schema/auction.schema';

const router = express.Router();

router.get('/', AuctionController.getAllAuctionHandler);
router.get('/:auctionId', AuctionController.getAuctionHandler);

export default router;