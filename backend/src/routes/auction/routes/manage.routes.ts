import express from 'express';
import * as Controller from '../../../controller/auction.controller';
import requireUser from '../../../middleware/requireUser';
import requireAuctionOwnerOrAdmin from '../../../middleware/auctionOwnerOrAdmin';
import * as Validator from '../../../middleware/validateResource';
import { createAuctionSchema, editAuctionSchema, getAuctionSchema } from '../../../schema/auction.schema';
import { uploadAuctionImages } from '../../../utils/multer';

const router = express.Router();

router.post('/', requireUser, (req, res, next) => {
    uploadAuctionImages(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Max size is 3MB.' });
            }
            return res.status(500).json({ message: 'File upload error', error: err.message, code: err.code });
        }
        next(); // Se non ci sono errori, passa alla validazione e al controller
    });
}, Validator.validateBody(createAuctionSchema), Controller.createAuctionHandler);

router.put('/:auctionId', Validator.validateBody(editAuctionSchema), Validator.validateParams(getAuctionSchema), requireAuctionOwnerOrAdmin, (req, res, next) => {
    uploadAuctionImages(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Max size is 3MB.' });
            }
            return res.status(500).json({ message: 'File upload error', error: err.message, code: err.code });
        }
        next(); // Se non ci sono errori, passa alla validazione e al controller
    });
}, Controller.editAuctionHandler);

router.delete('/:auctionId', Validator.validateParams(getAuctionSchema), requireAuctionOwnerOrAdmin, Controller.deleteAuctionHandler);

router.post('/:auctionId/like', Validator.validateParams(getAuctionSchema), requireUser, Controller.likeAuctionHandler);

router.post('/:auctionId/dislike', Validator.validateParams(getAuctionSchema), requireUser, Controller.dislikeAuctionHandler);

export default router;