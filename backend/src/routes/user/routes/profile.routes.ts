import express from 'express';
import * as UserController from '../../../controller/user.controller';
import requireUser from '../../../middleware/requireUser';
import upload from '../../../utils/multer';
import * as AuctionController from "../../../controller/auction.controller";

const router = express.Router();

router.post('/avatar', requireUser, upload.single('avatar'), UserController.uploadAvatarHandler);
router.get('/auction', requireUser, AuctionController.getUserAuctionsHandler);
router.get('/info', requireUser, UserController.getUserInfo)

export default router;