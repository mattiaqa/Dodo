import { Request, Response } from "express";
import { findUser, updateUser } from "../service/user.service";
import { signJwt, verifyJwt } from "../utils/jwt.utils";
import Invitation from '../models/invitation.model';
import { checkAlreadyInvited, createInvitationLink, sendInviteEmail } from "../service/invitation.service";


export async function inviteUserHandler(req: Request, res: Response)
{
  const { email } = req.body;

  const alreadyInvited = await checkAlreadyInvited(email);
  if(alreadyInvited)
  {
    res.status(401).send({ message: 'You already sent an invite for this user' });
    return;
  }

  try {
    const admin = await findUser({_id: res.locals.user._id});
    if(!admin)
    {
      res.status(500).send({message: "Error getting the session"});
      return;
    }

    const user = await findUser({ email: email});
    if(!user)
    {
      res.status(404).send({ message: 'The email does not exist' });
      return;
    }
    if(user.isAdmin)
    {
      res.status(401).send({ message: 'The user is already a moderator' });
      return;
    }

    // Genera un token JWT con scadenza di 10 giorni
    const token = signJwt(
      { email },
      { expiresIn: '10d' } // 10 giorni
    );

    // Calcola la data di scadenza
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 10);

    const link = await createInvitationLink(email, token, expireDate);
    await sendInviteEmail(email, link, admin.name, user.name);

    res.status(201).send({
       message: 'Link di invito generato con successo!',
       link,
    });

    return;
  
    } catch (err: any) {
      res.status(500).send({
          message: 'Errore durante la generazione del link di invito.',
          error: err.message,
      });
      return;
    }
}

export async function acceptInviteHandler(req: Request, res: Response) {
  const token = req.params.token;

  if(!token)
  {
    res.status(400).send({ message: 'Il token è obbligatorio.' });
    return;
  }

  try 
  {
    const invitation = await Invitation.findOne({ token });
    if(!invitation)
    {
      res.status(404).send({ message: "Invito non trovato!"});
      return;
    }

    if(invitation.used)
    {
      res.status(400).send({ message: "Questo link di invito è già stato usato"});
      return;
    }

    if (new Date() > invitation.expiresAt) 
    {
      res.status(400).send({ message: 'Questo invito è scaduto.' });
      return;
    }

    const { email }  = verifyJwt(token).decoded as {email : string};

    if(email !== res.locals.user.email)
    {
      res.status(403).send({ message: "This is not your invite" });
      return;
    }

    const updatedUser = await updateUser({ _id: res.locals.user._id }, { isAdmin: true });
    if (!updatedUser) {
      res.status(500).send({ message: 'Errore durante l\'elaborazione della richiesta' }); 
      return;
    }

    invitation.used = true;
    await invitation.save();

    res.send({ message: 'Invite acceppted successfully'});
  } 
  catch (err: any) 
  {
    res.status(400).send({
      message: 'Errore durante l\'accettazione dell\'invito.',
      error: err.message,
    });
    return;
  }
}