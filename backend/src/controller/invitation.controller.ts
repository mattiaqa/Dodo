import {Request, Response} from "express";
import {getUserByEmail, updateUser} from "../service/user.service";
import {signJwt, verifyJwt} from "../utils/jwt.utils";
import Invitation from '../models/invitation.model';
import {checkAlreadyInvited, createInvitationLink, sendInviteEmail} from "../service/invitation.service";
import logger from "../utils/logger";
import { z } from "zod";
import { acceptInvitationSchema, invitationSchema } from "../schema/invitation.schema";

interface InviteTokenType
{
    email: string;
}

/**
 * Handler to invite a user to become a moderator.
 *
 * Process:
 * - Verifies that an invitation for the user hasn't already been sent.
 * - Checks if the email provided exists in the system.
 * - Ensures that the user is not already a moderator.
 * - Generates a JWT token for the invitation and creates an invitation link with an expiration date.
 * - Sends an email with the invitation link to the user.
 * - Returns a success message and the generated invitation link.
 * - If any issues arise (e.g., already invited, invalid email, user is a moderator), returns an appropriate error message.
 */
export async function inviteUserHandler(req: Request<{},{}, z.infer<typeof invitationSchema>>, res: Response) {
    try {
        const { email } = req.body;

        const alreadyInvited = await checkAlreadyInvited(email);
        if (alreadyInvited) {
            res.status(401).send({ message: 'You already sent an invite for this user'});
            return;
        }

        const admin = res.locals.user!;
        const user = await getUserByEmail(email);
        if (!user) {
            res.status(404).send({message: 'The email does not exist'});
            return;
        }
        if (user.isAdmin) {
            res.status(401).send({message: 'The user is already a moderator'});
            return;
        }

        const token = signJwt(
            { email },
            { expiresIn: '10d' } // 10 days expiration
        );

        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 10);

        const link = await createInvitationLink(email, token, expireDate);
        await sendInviteEmail(email, link, admin.name, user.name);

        res.status(201).send({
            message: 'Invitation link successfully generated!',
            link,
        });

        return;
    } catch (err: any) {
        logger.error(err);
        res.status(500).send({
            message: 'Error while generating the invitation link.',
        });
        return;
    }
}

/**
 * Handler to accept an invitation and become a moderator.
 *
 * Process:
 * - Verifies the validity of the invitation token.
 * - Checks if the invitation has already been used or has expired.
 * - Decodes and validates the JWT token to ensure the user is authorized to accept the invitation.
 * - Updates the user's role to 'moderator' (isAdmin: true).
 * - Marks the invitation as used.
 * - Sends a success message upon successful acceptance.
 * - Returns an error message for invalid tokens, expired invitations, or already used invitations.
 */
export async function acceptInviteHandler(req: Request<z.infer<typeof acceptInvitationSchema>>, res: Response) {
    try {
        const { token } = req.params;

        const invitation = await Invitation.findOne({ token });
        if (!invitation) {
            res.status(404).send({message: "No invitation found"});
            return;
        }

        if (invitation.used) {
            res.status(400).send({message: "This link has already been used"});
            return;
        }

        if (new Date() > invitation.expiresAt) {
            res.status(400).send({message: 'Expired link'});
            return;
        }

        const { decoded, valid, expired } = verifyJwt<InviteTokenType>(token);
        if (!decoded || !valid || expired) {
            res.status(400).send({ message: "Invalid Token" });
            return;
        }

        const { email } = decoded;
        if (email !== res.locals.user!.email) {
            res.status(403).send({message: "You do not have access to this invitation"});
            return;
        }

        const updatedUser = await updateUser({ _id: res.locals.user!.id }, { isAdmin: true });
        if (!updatedUser) {
            res.status(500).send({message: "Internal Server Error"});
            return;
        }

        invitation.used = true;
        await invitation.save();

        res.send({message: 'Invite accepted successfully'});
    } catch (err: any) {
        logger.error(err);
        res.status(500).send({message: "Internal Server Error"});
        return;
    }
}