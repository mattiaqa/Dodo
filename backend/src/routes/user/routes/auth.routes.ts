import express from 'express';
import * as AuthController from '../../../controller/session.controller';
import * as Validator from '../../../middleware/validateResource';
import requireUser from '../../../middleware/requireUser';
import requireAdmin from '../../../middleware/requireAdmin';
import { loginSchema } from '../../../schema/session.schema';
import { createUserSchema, getUserSchema } from '../../../schema/user.schema';

const router = express.Router();

router.post('/register', Validator.validateBody(createUserSchema), AuthController.createUserHandler);
router.get('/register/:token/confirm', AuthController.confirmUserHandler);
router.delete('/:userId/delete', [requireAdmin, Validator.validateParams(getUserSchema)], AuthController.deleteUserHandler);

router.post('/login', Validator.validateBody(loginSchema), AuthController.createSessionHandler);
router.delete('/logout', [requireUser], AuthController.deleteSessionHandler);
//router.get('/session', requireUser, AuthController.getUserSessionHandler);


export default router;