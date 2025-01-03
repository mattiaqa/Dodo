import express from 'express';
import * as Controller from '../../../controller/download.controller';
import validateResource from '../../../middleware/validateResource';
import {downloadImageSchema} from "../../../schema/download.schema";

const router = express.Router();

router.get('/:filename', validateResource(downloadImageSchema), Controller.imageDownload);

export default router;