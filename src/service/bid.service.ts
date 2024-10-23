import { FilterQuery, QueryOptions } from "mongoose";
import BidModel, { BidInput, BidDocument } from "../models/bid.model";

export async function placeBid(input: BidInput) {
  try {
    const bid = await BidModel.create(input);
 
    return bid.toJSON();
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getBids(query: FilterQuery<BidDocument>, options: QueryOptions = {lean: true}) {
  try {
    return await BidModel.find(query, {}, options);
  } catch(e: any) {
    throw new Error(e);
  }
}