import express from 'express';
import * as Controller from '../../../controller/chat.controller';
import requireUser from '../../../middleware/requireUser';
import validateResource from '../../../middleware/validateResource';
import { getChatSchema } from '../../../schema/chat.schema';
import { sendMessageSchema } from '../../../schema/message.schema';

const router = express.Router();
router.use(requireUser);

//  /api/chat
router.get('/', validateResource(getChatSchema), Controller.getChatHandler);
router.post('/', validateResource(sendMessageSchema), Controller.sendMessageHandler);
router.get('/all', Controller.getUserChatHandler);

export default router;