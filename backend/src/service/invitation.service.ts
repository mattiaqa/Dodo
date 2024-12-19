import Invitation, { IInvitation } from "../models/invitation.model";
import config from 'config';
import { renderEmail, sendEmail } from "../utils/sendMail";

export async function checkAlreadyInvited(email: string)
{
    const res = await Invitation.findOne({
        email: email,
        used: false,
        expiresAt: { $gt: new Date() }
      });

    return res ? true : false;
}

export async function createInvitationLink(email: string, token: string, expireDate: Date)
{
    // Salva l'invito nel database
    const invitation: IInvitation = new Invitation({
        email,
        token,
        expiresAt: expireDate,
    });
    await invitation.save();
  
    // Genera il link di invito
    const port = config.get<number>('port');
    const hostname = config.get('hostname');
    const invitationLink = `http://${hostname}:${port}/invitation/accept/${token}`;

    return invitationLink;
}

export async function sendInviteEmail(address: string, link: string, inviterName: string, recieverName: string)
{
    const emailData = {
        reciever_name: recieverName,
        sender_name: inviterName,
        link: link,
    };
  
    // Renderizza il template EJS
    const emailBody = await renderEmail('invitation', emailData);
    await sendEmail(address, "You recieved an invitation", emailBody);
}