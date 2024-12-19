import express from 'express';
import * as Controller from '../../../controller/comment.controller';
import requireUser from '../../../middleware/requireUser';
import validateResource from '../../../middleware/validateResource';
import { createCommentSchema } from '../../../schema/comment.schema';

const router = express.Router();

router.post('/:auctionId/comment', requireUser, validateResource(createCommentSchema), Controller.addCommentHandler);
router.get('/:auctionId/comments', Controller.getCommentsHandler);

export default router;