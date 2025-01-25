import {Request, Response} from "express";
import {getUserByEmail, updateUser} from "../service/user.service";
import {signJwt, verifyJwt} from "../utils/jwt.utils";
import Invitation from '../models/invitation.model';
import {checkAlreadyInvited, createInvitationLink, sendInviteEmail} from "../service/invitation.service";
import logger from "../utils/logger";
import { z } from "zod";
import { acceptInvitationSchema, invitationSchema } from "../schema/invitation.schema";


export async function inviteUserHandler(req: Request<{},{}, z.infer<typeof invitationSchema>>, res: Response) {
    try {
        const { email } = req.body;
    
        const alreadyInvited = await checkAlreadyInvited(email);
        if (alreadyInvited) {
            res.status(401).send({ "Error": 'You already sent an invite for this user'});
            return;
        }

        const admin = res.locals.user!;
        const user = await getUserByEmail( email );
        if (!user) {
            res.status(404).send({"Error": 'The email does not exist'});
            return;
        }
        if (user.isAdmin) {
            res.status(401).send({"Error": 'The user is already a moderator'});
            return;
        }

        const token = signJwt(
            {email},
            {expiresIn: '10d'} // 10 giorni
        );

        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 10);

        const link = await createInvitationLink(email, token, expireDate);
        await sendInviteEmail(email, link, admin.name, user.name);

        res.status(201).send({
            "Message": 'Invitation link successfully generated!',
            link,
        });

        return;

    } catch (err: any) {
      logger.error(err);
      res.status(500).send({
          "Error": 'Error while generating the invitation link.',
      });
      return;
    }
}

interface InviteTokenType
{
    email: string;
}

export async function acceptInviteHandler(req: Request<z.infer<typeof acceptInvitationSchema>>, res: Response) {
    try {
        const { token } = req.params;

        /*
        if (!token) {
            res.status(400).send({message: 'Token is mandatory'});
            return;
        }*/

        const invitation = await Invitation.findOne({token});
        if (!invitation) {
            res.status(404).send({"Error": "No invitation found"});
            return;
        }

        if (invitation.used) {
            res.status(400).send({"Error": "This link has already been used"});
            return;
        }

        if (new Date() > invitation.expiresAt) {
            res.status(400).send({"Error": 'Expired link'});
            return;
        }

        const { decoded, valid, expired } = verifyJwt<InviteTokenType>(token);
        if(!decoded || !valid || expired)
        {
            res.status(400).send({message: "Invalid Token"});
            return;
        }

        const {email} = decoded;
        if (email !== res.locals.user!.email) {
            res.status(403).send({"Error": "You do not have access to this invitation"});
            return;
        }

        const updatedUser = await updateUser({_id: res.locals.user!.id}, {isAdmin: true});
        if (!updatedUser) {
            res.status(500).send({"Error": "Internal Server Error"});
            return;
        }

        invitation.used = true;
        await invitation.save();

        res.send({"Message": 'Invite accepted successfully'});
    } catch (err: any) {
        logger.error(err);
        res.status(500).send({"Error": "Internal Server Error"});
        return;
    }
}