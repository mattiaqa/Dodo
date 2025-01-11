import { FilterQuery, QueryOptions } from "mongoose";
import BidModel, { BidInput, BidDocument } from "../models/bid.model";

import sanitize from "mongo-sanitize";
import { updateAuction } from "./auction.service";
import { z } from "zod";
import { placeBidSchema } from "../schema/bid.schema";

export async function placeBid(buyer: string, bid: z.infer<typeof placeBidSchema>) {
  try {
    const sanitizedBuyer = sanitize(buyer);
    const sanitizedBid = sanitize(bid);
    const result = await BidModel.create({buyer: sanitizedBuyer, auctionId: sanitizedBid.auctionId, amount: sanitizedBid.amount});
    
    const auction = await updateAuction(sanitizedBid.auctionId, {
                lastBid: sanitizedBid.amount
            });
    
    return result.toJSON();
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getBids(query: FilterQuery<BidDocument>, options: QueryOptions = {lean: true}) : 
  Promise<BidDocument[]> {
  try {
    const sanitizedQuery = sanitize(query);
    return await BidModel.find(sanitizedQuery, {}, options);
  } catch(e: any) {
    throw new Error(e);
  }
}

export async function getWinner(query: FilterQuery<BidDocument>): Promise<BidDocument | null> {
  try {
    //const auctionIdSanitized = sanitize(auctionId);

    const bids = await BidModel.find(query);

    if(bids.length == 0)
      return null;

    return bids.reduce((maxBid, currentBid) => {
      return currentBid.amount > maxBid.amount ? currentBid : maxBid;
    });
  } catch(e: any) {
    throw new Error(e);
  }
}