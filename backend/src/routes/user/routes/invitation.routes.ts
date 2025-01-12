import express from 'express';
import * as Controller from '../../../controller/invitation.controller';
import requireUser from '../../../middleware/requireUser';
import requireAdmin from '../../../middleware/requireAdmin';
import * as Validator from '../../../middleware/validateResource';
import { acceptInvitationSchema, invitationSchema } from '../../../schema/invitation.schema';

const router = express.Router();

router.post('invitation/invite', [requireAdmin, Validator.validateBody(invitationSchema)], Controller.inviteUserHandler);
router.get('invitation/accept/:token', [requireUser, Validator.validateParams(acceptInvitationSchema)], Controller.acceptInviteHandler);

export default router;