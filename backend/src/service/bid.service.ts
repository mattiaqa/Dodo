import { FilterQuery, QueryOptions } from "mongoose";
import BidModel, { BidInput, BidDocument } from "../models/bid.model";

import sanitize from "mongo-sanitize";

export async function placeBid(input: BidInput) {
  try {
    const sanitizedInput = sanitize(input);
    const bid = await BidModel.create(sanitizedInput);
 
    return bid.toJSON();
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getBids(query: FilterQuery<BidDocument>, options: QueryOptions = {lean: true}) {
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