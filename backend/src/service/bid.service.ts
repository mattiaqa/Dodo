import { FilterQuery, QueryOptions } from "mongoose";
import BidModel, { BidInput, BidDocument } from "../models/bid.model";

import sanitize from "mongo-sanitize";
import { updateAuction } from "./auction.service";
import { z } from "zod";
import { placeBidSchema } from "../schema/bid.schema";

export async function placeBid(buyer: string, auctionId: string, amount: number) {
  try {
    const sanitizedBuyer = sanitize(buyer);
    const result = await BidModel.create({buyer: sanitizedBuyer, auctionId, amount});
    
    const auction = await updateAuction(auctionId, {
                lastBid: amount
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

export async function getBidsDistinct(query: FilterQuery<BidDocument>, options: QueryOptions = {lean: true}) :
    Promise<string[]> {
  try {
    return await BidModel.find(query).distinct('auctionId');
  } catch(e: any) {
    throw new Error(e);
  }
}

export async function getMostRecentBid(auctionId: string): Promise<BidDocument | null> {
  try {
    const mostRecentBid = await BidModel.findOne({ auctionId })
        .sort({ createdAt: -1 })
        .exec();

    return mostRecentBid;
  } catch (e: any) {
    throw new Error(`Error fetching most recent bid: ${e.message}`);
  }
}

export async function getWinner(query: FilterQuery<BidDocument>): Promise<BidDocument | null> {
  try {
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