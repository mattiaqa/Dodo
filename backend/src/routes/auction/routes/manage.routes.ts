import express from 'express';
import * as Controller from '../../../controller/auction.controller';
import requireUser from '../../../middleware/requireUser';
import requireAdmin from '../../../middleware/requireAdmin';
import requireAuctionOwnerOrAdmin from '../../../middleware/auctionOwnerOrAdmin';
import * as Validator from '../../../middleware/validateResource';
import { createAuctionSchema, editAuctionSchema, getAuctionSchema } from '../../../schema/auction.schema';
import fetchBook from '../../../middleware/bookExists';
import { uploadAuctionImages } from '../../../utils/multer';

const router = express.Router();

//crea un'asta
router.post('/', requireUser, Validator.validateBody(createAuctionSchema), uploadAuctionImages, /*fetchBook,*/ Controller.createAuctionHandler);

//modifica un'asta
router.put('/:auctionId', Validator.validateBody(editAuctionSchema), Validator.validateParams(getAuctionSchema), requireAuctionOwnerOrAdmin, Controller.editAuctionHandler);

//elimina un'asta
router.delete('/:auctionId', Validator.validateParams(getAuctionSchema), requireAuctionOwnerOrAdmin, Controller.deleteAuctionHandler);

router.post('/:auctionId/like', Validator.validateParams(getAuctionSchema), requireUser, Controller.likeAuctionHandler)

router.post('/:auctionId/watchlist', Validator.validateParams(getAuctionSchema), requireUser, Controller.addToWatchlistHandler)

export default router;