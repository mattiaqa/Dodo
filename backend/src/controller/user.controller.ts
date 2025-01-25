import { Request, Response } from "express";
import { getUserById, updateUser } from "../service/user.service";
import { scanFile } from "../utils/clamAV";
import { unlink } from "fs/promises";
import logger from "../utils/logger";
import { getUserSchema } from "../schema/user.schema";
import { z } from "zod";
import { getUserAuctions } from "../service/auction.service";
import { saveFilesToDisk } from "../utils/multer";
import path from "path";


export async function uploadAvatarHandler(req: Request, res: Response) {
 
  if (req.files) {
    res.status(400).send({ "Error": 'Only one file is allowed' });
    return;
  }
  
  const file = req.file;
  const userId = res.locals.user!.id;

  const previousAvatar = (await getUserById(userId))?.avatar;
  if(previousAvatar)
    await unlink(path.join(__dirname, '../../public/uploads/avatars', previousAvatar)).catch((err) => console.error(`Error deleting file ${previousAvatar}:`, err));

  let uploadedImagePath: string = '';
  try {
    // Scan file for security checks
    /*const { isInfected, viruses } = await scanFile(file.path);
    if (isInfected) {
        //await unlink(file.path); // Use fs/promises for async
        res.status(400).send({ "Error" : 'File is infected and was removed.' });
        return;
    }*/
    if(file)
    {
      const uploadedImage : Express.Multer.File[] = [];
      uploadedImage.push(file as Express.Multer.File);
      uploadedImagePath = (await saveFilesToDisk(uploadedImage, 'avatars'))[0]; // Salva i file nel file system
    }
    // Update user with avatar
    const updatedUser = await updateUser({ _id: userId }, file ? { $set: { avatar: uploadedImagePath } } : { $unset: { avatar: '' } });
    if (!updatedUser) {
        //await unlink(file.path); // Clean up on database failure
        res.status(500).send({ "Error" : 'Failed to update user profile with avatar.' });
        return;
    }
    // Respond with success
    res.send({
        "Message" : 'Avatar uploaded successfully',
        "avatar" : updatedUser.avatar,
    });
  } catch (err) {
      logger.error(err);
      // Clean up file on any unexpected error
      try {
        if(uploadedImagePath !== "")
          await unlink(uploadedImagePath).catch((err) => console.error(`Error deleting file ${uploadedImagePath}:`, err));
      } catch (unlinkError) {
          logger.error('Failed to remove file after error:', unlinkError);
      }

      res.status(500).send({ "error": 'An unexpected error occurred.' });
  }
}


export async function getCurrentUserAuctionsHandler(req: Request, res: Response) {
  const seller = res.locals.user!.id;

  try {
    const auctions = await getUserAuctions({ seller });

    if(!auctions) {
      res.status(404).send({"Error": "The user has not yet created any auctions"});
      return;
    }

    res.send(auctions);
  } catch (e: any) {
    logger.error(e);
    res.status(500).send({"Error": "Internal Server Error"});
  }
}



export async function getUserInfoHandler(req: Request<z.infer<typeof getUserSchema>>, res: Response) {
  const { userId } = req.params;
  const authenticatedUserId = res.locals.user?.id
  const foundUser = await getUserById(userId);

  if (!foundUser) {
    res.status(404).send({"Error" : "User not found"});
    return;
  }

  if (userId === authenticatedUserId) {
    res.send(foundUser);
  } else {
    const { savedAuctions, ...userWithoutSavedAuctions } = foundUser;
    res.send(userWithoutSavedAuctions);
  }
}

/*
export async function getCurrentUserInfoHandler(req: Request, res: Response) {
  const userId = res.locals.user!.id;
  const user = await findUser({ _id: userId });

  if (!user) {
    res.status(404).send({"Error" : "User not found"});
    return;
  }

  res.send(user);
}
*/