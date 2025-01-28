import express from 'express';
import * as Controller from '../../../controller/chat.controller';
import requireUser from '../../../middleware/requireUser';
import * as Validator from '../../../middleware/validateResource';
import { getChatSchema } from '../../../schema/chat.schema';
import { sendMessageSchema } from '../../../schema/message.schema';

const router = express.Router();
router.use(requireUser);

router.get('/:auctionId/content', Controller.getChatHandler);
router.post('/', Validator.validateBody(sendMessageSchema), Controller.sendMessageHandler);
router.get('/all', Controller.getUserChatHandler);

export default router;