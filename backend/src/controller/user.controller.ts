import { Request, Response } from "express";
import { GetUserInput } from "../schema/user.schema";
import { findUser, updateUser } from "../service/user.service";
import { scanFile } from "../utils/clamAV";
import { unlink } from "fs";
import logger from "../utils/logger";


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
