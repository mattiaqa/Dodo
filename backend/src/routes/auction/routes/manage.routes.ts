import express from 'express';
import * as Controller from '../../../controller/auction.controller';
import requireUser from '../../../middleware/requireUser';
import requireAuctionOwnerOrAdmin from '../../../middleware/auctionOwnerOrAdmin';
import * as Validator from '../../../middleware/validateResource';
import { createAuctionSchema, editAuctionSchema, getAuctionSchema } from '../../../schema/auction.schema';
import { uploadAuctionImages } from '../../../utils/multer';

const router = express.Router();

//crea un'asta
router.post('/', requireUser, Validator.validateBody(createAuctionSchema), Controller.createAuctionHandler);

//modifica un'asta
router.put('/:auctionId', Validator.validateBody(editAuctionSchema), Validator.validateParams(getAuctionSchema), requireAuctionOwnerOrAdmin, Controller.editAuctionHandler);

//elimina un'asta
router.delete('/:auctionId', Validator.validateParams(getAuctionSchema), requireAuctionOwnerOrAdmin, Controller.deleteAuctionHandler);

router.post('/:auctionId/like', Validator.validateParams(getAuctionSchema), requireUser, Controller.likeAuctionHandler);

router.post('/:auctionId/dislike', Validator.validateParams(getAuctionSchema), requireUser, Controller.dislikeAuctionHandler);

export default router;