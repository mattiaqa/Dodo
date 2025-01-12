import express from 'express';
import * as Controller from '../../../controller/user.controller';
import requireUser from '../../../middleware/requireUser';
import { uploadProfilePicture } from '../../../utils/multer';
import * as Validator from "../../../middleware/validateResource";
import { getUserSchema } from '../../../schema/user.schema';

const router = express.Router();

router.post('/avatar', [requireUser, uploadProfilePicture], Controller.uploadAvatarHandler);
router.get('/auctions', requireUser, Controller.getCurrentUserAuctionsHandler);
router.get('/:userId/info', [requireUser, Validator.validateParams(getUserSchema)], Controller.getUserInfoHandler)

export default router;