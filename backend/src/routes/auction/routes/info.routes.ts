import express from 'express';
import * as AuctionController from '../../../controller/auction.controller';
import validateResource from '../../../middleware/validateResource';
import { searchAuctionSchema } from '../../../schema/auction.schema';

const router = express.Router();

//router.get('/:auctionId', AuctionController.getAuctionHandler);

//tutte le aste, con filtri query params
router.get('/', AuctionController.getAllAuctionHandler);

export default router;