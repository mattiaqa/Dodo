import express from 'express';
import * as AuctionController from '../../../controller/auction.controller';
import validateResource from '../../../middleware/validateResource';
import { searchAuctionSchema } from '../../../schema/auction.schema';

const router = express.Router();

router.get('/all', AuctionController.getAllAuctionHandler);
router.post('/search', [validateResource(searchAuctionSchema)], AuctionController.searchAuctionHandler);
router.get('/:auctionId', AuctionController.getAuctionHandler);

export default router;