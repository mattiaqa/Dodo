import express from 'express';
import * as AuctionController from '../../../controller/auction.controller';
import requireUser from '../../../middleware/requireUser';
import validateResource from '../../../middleware/validateResource';
import { getAuctionSchema, searchAuctionSchema } from '../../../schema/auction.schema';

const router = express.Router();

router.get('/auctions', requireUser, AuctionController.getUserAuctionsHandler);
router.get('/all', AuctionController.getAllAuctionHandler);
router.post('/search', [validateResource(searchAuctionSchema)], AuctionController.searchAuctionHandler);

export default router;