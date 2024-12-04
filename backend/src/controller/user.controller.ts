import { Request, Response } from "express";
import { CreateUserInput, GetUserInput } from "../schema/user.schema";
import { createUser, findUser, getUserAuctions, deleteUser, updateUser } from "../service/user.service";
import { omit } from "lodash";
import { scanFile } from "../utils/clamAV";
import { unlink } from "fs";
import { signJwt, verifyJwt } from "../utils/jwt.utils";
import Invitation, { IInvitation } from '../models/invitations.model';
import config from 'config';

import logger from "../utils/logger";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput["body"]>,
  res: Response
) {
  try {
    const user = await createUser(req.body);
    res.send(user);
  } catch (e: any) {
    logger.error(e);
    res.status(409).send(e.message);
  }
}

export async function getUserAuctionsHandler(req: Request, res: Response) {
  const seller = res.locals.user._id;

  try {
    const auctions = await getUserAuctions({ seller });

    if(!auctions) {
      res.sendStatus(404);
      return;
    }

    res.send(auctions);
  } catch (e: any) {
    logger.error(e);
    res.status(409).send(e.message);
  }
}

export async function deleteUserHandler(req: Request<GetUserInput['body']>, res: Response){
  const userId = res.locals.user._id;

  const user = await findUser({ _id: userId });

  if (!user) {
    res.sendStatus(404);
    return;
  } 

  const deletedUser = await deleteUser({ _id: userId });

  res.send(omit(deletedUser, 'password'));
};

export async function uploadAvatarHandler(req: Request<GetUserInput['body']>, res: Response) {
  if(!req.file) {
    res.sendStatus(400);
    return;
  }
  
  const file = req.file;
  const userId = res.locals.user._id;

  const { isInfected, viruses } = await scanFile(file?.path);

  if(isInfected) {
    unlink(file!.path, (err) => {
      if (err) {
        logger.error("Error during file removing!");
      }
    });

    res.sendStatus(500);
    return;
  }

  const user = await findUser({ _id: userId });

  if (!user) {
    res.sendStatus(404);
    return;
  } 

  const updatedUser = await updateUser({ _id: userId }, { avatar: file.filename });

  if (!updatedUser) {
      res.sendStatus(500); 
      return;
  }

  res.send({"avatar": updatedUser.avatar});
}

export async function inviteUserHandler(req: Request, res: Response)
{
  const { email } = req.body;

  if (!email) {
    res.status(400).send({ message: 'Email è richiesta.' });
    return;
  }
  const alreadyInvited = await Invitation.findOne({
    used: false,
    expiresAt: { $gt: new Date() }
  })
  if(alreadyInvited)
  {
    res.status(401).send({ message: 'You already sent an invite for this user' });
    return;
  }


  try {
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
   
   res.status(201).send({
       message: 'Link di invito generato con successo!',
       link: invitationLink,
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