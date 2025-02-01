import express from 'express';
import * as Controller from '../../../controller/chat.controller';
import requireUser from '../../../middleware/requireUser';
import * as Validator from '../../../middleware/validateResource';
import { getChatSchema } from '../../../schema/chat.schema';
import { sendMessageSchema } from '../../../schema/message.schema';

const router = express.Router();
router.use(requireUser);

router.get('/:chatId/content', Controller.getChatContentHandler);
router.get('/:auctionId/chat', Controller.getChatIdHandler);
router.get('/all', Controller.getUserChatHandler);
router.post('/send', Validator.validateBody(sendMessageSchema), Controller.sendMessageHandler);

export default router;