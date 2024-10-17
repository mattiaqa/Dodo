import { Request, Response } from "express";
import { CreateAuctionInput } from "../schema/auction.schema";
import { createAuction } from "../service/auction.service";
import logger from "../utils/logger";

export async function createAuctionHandler(
  req: Request<{}, {}, CreateAuctionInput["body"]>,
  res: Response
) {
  try {
    const userId = res.locals.user._id;
    const body = req.body;

    const auction = await createAuction({...body, seller: userId});
    res.send(auction);
  } catch (e: any) {
    logger.error(e);
    res.status(409).send(e.message);
  }
}
