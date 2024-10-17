import AuctionModel, { AuctionDocument, AuctionInput } from "../models/auction.model";

export async function createAuction(input: AuctionInput) {
  try {
    const auction = await AuctionModel.create(input);

    return auction.toJSON();
  } catch (e: any) {
    throw new Error(e);
  }
}