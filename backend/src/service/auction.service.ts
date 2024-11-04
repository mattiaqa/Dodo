import { FilterQuery, QueryOptions } from "mongoose";
import AuctionModel, { AuctionDocument, AuctionInput } from "../models/auction.model";

export async function createAuction(input: AuctionInput) {
  try {
    const auction = await AuctionModel.create(input);

    return auction.toJSON();
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function findAuction(query: FilterQuery<AuctionDocument>, options: QueryOptions = {lean: true}) {
  try {
    return await AuctionModel.findOne(query, {}, options);
  } catch(e: any) {
    throw new Error(e);
  }
}

export async function findAllAuction(options: QueryOptions = {lean: true}) {
  try {
    const currentDate = new Date();
    return await AuctionModel.find({ expireDate: { $gte: currentDate } }, {}, options);
  } catch(e: any) {
    throw new Error(e);
  }
}

export async function deleteAuction(query: FilterQuery<AuctionDocument>) {
  try {
    return await AuctionModel.deleteOne(query);
  } catch(e: any) {
    throw new Error(e);
  }
}