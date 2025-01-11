import express from 'express';
import * as Controller from '../../../controller/download.controller';
import * as Validator from '../../../middleware/validateResource';
import {downloadImageSchema} from "../../../schema/download.schema";

const router = express.Router();

router.get('/:filename', Validator.validateParams(downloadImageSchema), Controller.imageDownload);

export default router;