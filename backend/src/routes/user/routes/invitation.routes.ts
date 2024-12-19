import express from 'express';
import * as Controller from '../../../controller/invitation.controller';
import requireUser from '../../../middleware/requireUser';
import requireAdmin from '../../../middleware/requireAdmin';
import validateResource from '../../../middleware/validateResource';
import { InvitationInputSchema } from '../../../schema/invitation.schema';

const router = express.Router();

router.post('invitation/invite', [requireAdmin, validateResource(InvitationInputSchema)], Controller.inviteUserHandler);
router.get('invitation/accept/:token', requireUser, Controller.acceptInviteHandler);

export default router;