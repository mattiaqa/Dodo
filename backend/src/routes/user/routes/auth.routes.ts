import express from 'express';
import * as AuthController from '../../../controller/session.controller';
import validateResource from '../../../middleware/validateResource';
import requireUser from '../../../middleware/requireUser';
import requireAdmin from '../../../middleware/requireAdmin';
import { createSessionSchema } from '../../../schema/session.schema';
import { createUserSchema, getUserSchema } from '../../../schema/user.schema';

const router = express.Router();

router.post('/register', validateResource(createUserSchema), AuthController.createUserHandler);
router.get('/register/:token/confirm', AuthController.confirmUserHandler);
router.delete('/', requireAdmin, validateResource(getUserSchema), AuthController.deleteUserHandler);

router.post('/login', validateResource(createSessionSchema), AuthController.createSessionHandler);
router.delete('/logout', requireUser, AuthController.deleteSessionHandler);
router.get('/session', requireUser, AuthController.getUserSessionHandler);


export default router;