import { Request, Response } from "express";
import { CreateUserInput, GetUserInput } from "../schema/user.schema";
import { createUser, findUser, getUserAuctions, deleteUser, updateUser } from "../service/user.service";
import { omit } from "lodash";
import { scanFile } from "../utils/clamAV";
import { unlink } from "fs";

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