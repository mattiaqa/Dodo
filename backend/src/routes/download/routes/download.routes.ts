import express from 'express';
import * as Controller from '../../../controller/download.controller';
import * as Validator from '../../../middleware/validateResource';
import {downloadImageSchema} from "../../../schema/download.schema";
import {downloadAvatar} from "../../../controller/download.controller";

const router = express.Router();

router.get('/image/:filename', Validator.validateParams(downloadImageSchema), Controller.imageDownload);
router.get('/avatar/:filename', Validator.validateParams(downloadImageSchema), Controller.downloadAvatar);
export default router;