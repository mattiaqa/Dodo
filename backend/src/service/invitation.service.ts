import { FilterQuery, QueryOptions } from "mongoose";
import Invitation, { IInvitation } from "../models/invitation.model";
import sanitize from "mongo-sanitize";
import config from 'config';
import axios from 'axios';

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
    const invitationLink = `http://localhost:${port}/invitation/accept/${token}`;

    return invitationLink;
}

export async function sendInviteEmail(address: string, link: string, inviterName: string, recieverName: string)
{
    const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string;

    // Verifica che la chiave API sia configurata
    if (!SENDGRID_API_KEY) {
        throw new Error('No SendGrid API Key configured');
    }

    try {

        // Corpo della richiesta
        const payload = {
            from: {
                email: "info.dodoreads@gmail.com",
            },
            personalizations: [{
                to: [{
                    email: `${address}`,
                }],
                dynamic_template_data: {
                    reciever_name: recieverName,
                    inviter_name: inviterName,
                    link: `${link}`
                },
            }],
            template_id: 'd-bbfd97413c994cbd8fb0e0fefa5f5a6b', // Sostituisci con il tuo ID del template
        };
        
        // Invio della richiesta con Axios
        const response = await axios.post(SENDGRID_API_URL, payload, {
            headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
            },
        });
  
        console.log('Email sent succesfully:', response.data);
    }
    catch (error: any)
    {
        if (error.response) {
          console.error('Error in SendGrid API:', error.response.data);
        } 
        else {
          console.error('Request error:', error.message);
        }
    }
}