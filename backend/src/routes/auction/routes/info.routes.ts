import express from 'express';
import * as AuctionController from '../../../controller/auction.controller';
import * as Validator from '../../../middleware/validateResource';
import { searchAuctionSchema } from '../../../schema/auction.schema';

const router = express.Router();

//tutte le aste, con filtri query params
router.get('/', Validator.validateQuery(searchAuctionSchema), AuctionController.getAllAuctionHandler);

export default router;