import express from 'express';
import * as Controller from '../../../controller/comment.controller';
import requireUser from '../../../middleware/requireUser';
import * as Validator from '../../../middleware/validateResource';
import { createCommentSchema } from '../../../schema/comment.schema';

const router = express.Router();

router.post('/:auctionId/comment', requireUser, Validator.validateBody(createCommentSchema), Controller.addCommentHandler);
router.get('/:auctionId/comment', Controller.getCommentsHandler);

export default router;