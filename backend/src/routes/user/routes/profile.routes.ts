import express from 'express';
import * as Controller from '../../../controller/user.controller';
import requireUser from '../../../middleware/requireUser';
import { uploadProfilePicture } from '../../../utils/multer';
import * as Validator from "../../../middleware/validateResource";
import { getUserSchema } from '../../../schema/user.schema';

const router = express.Router();
router.post('/avatar', requireUser, (req, res, next) => {
    uploadProfilePicture(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Max size is 1MB.' });
            }
            return res.status(500).json({ message: 'File upload error', error: err.message });
        }
        next(); // Se non ci sono errori, continua con il controller
    });
}, Controller.uploadAvatarHandler);

router.get('/auctions', requireUser, Controller.getCurrentUserAuctionsHandler);
router.get('/winning', requireUser, Controller.getCurrentUserWinningHandler);
router.get('/partecipated', requireUser, Controller.getCurrentUserPartecipationHandler);
router.get('/ongoing', requireUser, Controller.getCurrentOngoingAuctionsHandler);
router.get('/:userId/info', [requireUser, Validator.validateParams(getUserSchema)], Controller.getUserInfoHandler)

export default router;