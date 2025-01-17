import express from 'express';
import ProfileRoutes from './routes/profile.routes';
import AuthRoutes from './routes/auth.routes';
import InvitationRoutes from './routes/invitation.routes';
import csurf from 'csurf';

export const csrfProtection = csurf({ cookie: true })
const router = express.Router();

router.use(AuthRoutes);
router.use(ProfileRoutes, csrfProtection);
router.use(InvitationRoutes);

export default router;