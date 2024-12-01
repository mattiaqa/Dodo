import { Request, Response } from "express";
import { CreateUserInput, GetUserInput } from "../schema/user.schema";
import { createUser, findUser, getUserAuctions, deleteUser, updateUser } from "../service/user.service";
import { omit } from "lodash";
import { scanFile } from "../utils/clamAV";
import { unlink } from "fs";
import { Console } from "console";
import { signJwt } from "../utils/jwt.utils";
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

  try {
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
   const invitationLink = `http://localhost:${port}/accept-invite/${token}`;
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