import express from 'express';
import * as Controller from '../../../controller/auction.controller';
import requireUser from '../../../middleware/requireUser';
import requireAdmin from '../../../middleware/requireAdmin';
import requireAuctionOwnerOrAdmin from '../../../middleware/auctionOwnerOrAdmin';
import validateResource from '../../../middleware/validateResource';
import { createAuctionSchema } from '../../../schema/auction.schema';

const router = express.Router();

//crea un'asta
router.post('/', requireUser, validateResource(createAuctionSchema), Controller.createAuctionHandler);

//modifica un'asta
//router.put('/:auctionId', requireAuctionOwnerOrAdmin, Controller.editAuctionHandler);

//elimina un'asta
router.delete('/:auctionId', requireAuctionOwnerOrAdmin, Controller.deleteAuctionHandler);


export default router;