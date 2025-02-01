import { Request, Response } from "express";
import {findUsers, getUserById, updateUser} from "../service/user.service";
import { scanFile } from "../utils/clamAV";
import { unlink } from "fs/promises";
import logger from "../utils/logger";
import { getUserSchema } from "../schema/user.schema";
import { z } from "zod";
import {getAuctionById, getUserAuctions} from "../service/auction.service";
import { saveFilesToDisk } from "../utils/multer";
import path from "path";
import {getBidsDistinct} from "../service/bid.service";

/**
 * Handles the uploading of a user's avatar.
 * - Checks if there is already an avatar and deletes the previous one if it exists.
 * - Scans the uploaded file for viruses.
 * - Saves the valid avatar file to disk.
 * - Updates the user's avatar in the database.
 * - If an error occurs, attempts to clean up and delete the uploaded file.
 */
export async function uploadAvatarHandler(req: Request, res: Response) {

  if (req.files) {
    res.status(400).send({ "Error": 'Only one file is allowed' });
    return;
  }

  const file = req.file;
  const userId = res.locals.user!.id;
  let filename = "";
  let uploadedImagePath = "";

  const previousAvatar = (await getUserById(userId))?.avatar;
  if(previousAvatar)
    await unlink(path.join(__dirname, '../../public/uploads/avatars', previousAvatar))

  try {
    if(file)
    {
      const uploadedImage : Express.Multer.File[] = [];
      uploadedImage.push(file as Express.Multer.File);
      const { uploadedFilePaths, uploadedFilename } = await saveFilesToDisk(uploadedImage, 'avatars');

      filename = uploadedFilename[0];
      uploadedImagePath = uploadedFilePaths[0]

      const { isInfected, viruses } = await scanFile(uploadedFilePaths[0]);
      if (isInfected) {
        await unlink(uploadedFilePaths[0]);
        res.status(400).send({ "Error" : 'File is infected and was removed.' });
        return;
      }
    }

    const updatedUser = await updateUser({ _id: userId }, file ? { $set: { avatar: filename } } : { $unset: { avatar: '' } });
    if (!updatedUser) {
      res.status(500).send({ "Error" : 'Failed to update user profile with avatar.' });
      return;
    }

    res.send({
      "Message" : 'Avatar uploaded successfully',
      "avatar" : updatedUser.avatar,
    });
  } catch (err) {
    logger.error(err);

    try {
      if(uploadedImagePath !== "")
        await unlink(uploadedImagePath)
    } catch (unlinkError) {
      logger.error('Failed to remove file after error:', unlinkError);
    }

    res.status(500).send({ "error": 'An unexpected error occurred.' });
  }
}

/**
 * Retrieves all auctions that the current user has won.
 * - Queries auctions where the current user is the winner.
 * - If no auctions are found, returns a 404 error.
 * - Otherwise, returns the user's winning auctions.
 */
export async function getCurrentUserWinningHandler(req: Request, res: Response) {
  const userId = res.locals.user!.id;

  try {
    const auctions = await getUserAuctions({ winner: userId });

    if(!auctions) {
      res.status(404).send({"Error": "The user has not yet won any auctions"});
      return;
    }

    res.send(auctions);
  } catch (e: any) {
    logger.error(e);
    res.status(500).send({"Error": "Internal Server Error"});
  }
}

/**
 * Retrieves the auctions the user has participated in, but not necessarily won.
 * - Queries auctions where the current user has placed bids.
 * - Filters the auctions that are still active (not expired).
 * - Returns the valid ongoing auctions for the user.
 */
export async function getCurrentUserPartecipationHandler(req: Request, res: Response) {
  const userId = res.locals.user!.id;

  try {
    const auctions = await getBidsDistinct({ buyer: userId });

    if(!auctions) {
      res.status(404).send({"Error": "The user has not yet won any auctions"});
      return;
    }

    const auctionsDetails = await Promise.all(
        auctions.map(auction => getAuctionById(auction))
    );

    const now = new Date();
    const validAuctions = auctionsDetails.filter(auction => {
      const expirationDate = new Date(auction!.expireDate);
      return expirationDate <= now;
    });

    res.send(validAuctions);
  } catch (e: any) {
    logger.error(e);
    res.status(500).send({"Error": "Internal Server Error"});
  }
}

/**
 * Retrieves the auctions the user is currently participating in (i.e., ongoing auctions).
 * - Queries auctions where the current user has placed bids.
 * - Filters the auctions that are still ongoing (not expired).
 * - Returns the valid ongoing auctions for the user.
 */
export async function getCurrentOngoingAuctionsHandler(req: Request, res: Response) {
  const userId = res.locals.user!.id;

  try {
    const auctions = await getBidsDistinct({ buyer: userId });

    if(!auctions) {
      res.status(404).send({"Error": "The user has not yet won any auctions"});
      return;
    }

    const auctionsDetails = await Promise.all(
        auctions.map(auction => getAuctionById(auction))
    );

    const now = new Date();
    const validAuctions = auctionsDetails.filter(auction => {
      const expirationDate = new Date(auction!.expireDate);
      return expirationDate > now;
    });

    res.send(validAuctions);
  } catch (e: any) {
    logger.error(e);
    res.status(500).send({"Error": "Internal Server Error"});
  }
}

/**
 * Retrieves all auctions that the user has created.
 * - Queries auctions where the current user is the seller.
 * - Returns the user's created auctions or a 404 if no auctions are found.
 */
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

/**
 * Retrieves the user information for the specified userId.
 * - Checks if the user exists and returns their information.
 * - If the user is the same as the authenticated user, returns full details.
 * - Otherwise, omits saved auctions information from the response.
 */
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

/**
 * Bans a user by updating their `isBanned` status to true.
 * - Updates the user's status to banned.
 * - Returns success or failure based on the update result.
 */
export async function banUser(req: Request, res: Response) {
  const userId = req.body.userId;
  try {
    const updatedUser = await updateUser(
        { _id: userId },
        { $set: { isBanned: true } }
    );

    if (!updatedUser) {
      res.status(500).send({ "Error" : 'Failed to ban user ' });
      return;
    }

    res.send({"Message": "User Banned Successfully"})
  } catch (e: any) {
    logger.error(e);
    res.status(500).send({"Error": "Internal Server Error"});
  }
}

/**
 * Retrieves all users except the authenticated user.
 * - Queries all users and excludes the current authenticated user.
 * - Returns the list of users or a 404 if no users are found.
 */
export async function getAllUserHandler(req: Request, res: Response) {
  const currentUser = res.locals.user?.id;
  const foundUsers = await findUsers({});

  if (!foundUsers) {
    res.status(404).send({"Error" : "User not found"});
    return;
  }
  const filteredUsers = foundUsers.filter(
      user => user._id !== currentUser
  );

  res.send(filteredUsers);
}