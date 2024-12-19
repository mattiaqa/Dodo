import express from 'express';
import * as UserController from '../../../controller/user.controller';
import requireUser from '../../../middleware/requireUser';
import upload from '../../../utils/multer';

const router = express.Router();

router.post('/avatar', requireUser, upload.single('avatar'), UserController.uploadAvatarHandler);

export default router;