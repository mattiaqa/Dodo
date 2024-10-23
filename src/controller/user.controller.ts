import { Request, Response } from "express";
import { CreateUserInput } from "../schema/user.schema";
import { createUser, getUserAuctions } from "../service/user.service";
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