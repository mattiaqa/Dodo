import express from 'express';
import * as Controller from '../../../controller/comment.controller';
import requireUser from '../../../middleware/requireUser';
import * as Validator from '../../../middleware/validateResource';
import {createCommentSchema, deleteCommentSchema} from '../../../schema/comment.schema';
import requireAdmin from "../../../middleware/requireAdmin";

const router = express.Router();

router.post('/:auctionId/comment', requireUser, Validator.validateBody(createCommentSchema), Controller.addCommentHandler);
router.get('/:auctionId/comment', Controller.getCommentsHandler);
router.delete('/:commentId/delete', requireAdmin, Validator.validateParams(deleteCommentSchema), Controller.deleteCommentHandler);

export default router;