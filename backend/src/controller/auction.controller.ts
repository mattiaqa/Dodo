import { Request, Response } from "express";
import { CreateAuctionInput, UpdateAuctionInput, GetAuctionInput, SearchAuctionInput } from "../schema/auction.schema";
import { createAuction, findAuctionById, findAllAuction, deleteAuction, searchAuction } from "../service/auction.service";

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

export async function getAuctionHandler(req: Request<GetAuctionInput['body']>, res: Response){
  const auctionId = req.body.auctionId;
  const auction = await findAuctionById({ auctionId });

  if (!auction) {
    res.sendStatus(404);
    return;
  }

  res.send(auction);
};

export async function getAllAuctionHandler(req: Request, res: Response){
  const auctions = await findAllAuction();

  if (!auctions) {
    res.sendStatus(404);
    return;
  }

  res.send(auctions);
};

export async function deleteAuctionHandler(req: Request<GetAuctionInput['body']>, res: Response){
  const auctionId = req.body.auctionId;
  const userId = res.locals.user._id;

  const auction = await findAuctionById({ auctionId });

  if (!auction) {
    res.sendStatus(404);
    return;
  } 

  if(auction.seller != userId) {
    res.sendStatus(403);
    return;
  }

  const deletedAuction = await deleteAuction({ auctionId });

  res.send(deletedAuction);
};

export async function searchAuctionHandler(req: Request<SearchAuctionInput['body']>, res: Response) {
  const query = req.body.query;
  const auction = await searchAuction({title: { $regex: `.*${query}.*` }});
  
  if(!auction) {
    res.sendStatus(404);
    return;
  }

  res.send(auction);
}