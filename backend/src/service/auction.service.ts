import { FilterQuery, QueryOptions } from "mongoose";
import AuctionModel, { AuctionDocument, AuctionInput } from "../models/auction.model";
import logger from "../utils/logger";
import {Task, scheduler} from "../utils/scheduler"

import sanitize from "mongo-sanitize";
import {BidDocument} from "../models/bid.model";

export async function createAuction(newAuction: AuctionInput): Promise<AuctionDocument | undefined> {
  try {
    const newAuctionSanitized = sanitize(newAuction);

    const auction = await AuctionModel.create(newAuctionSanitized);

      if (auction) {
          const task: Task = {
              task_id: `SCHEDS:${auction.auctionId}`,
              auctionId: auction.auctionId,
              expiration: auction.expireDate,
          };

          await scheduler.scheduleTask(task);
      }

    return auction.toJSON();
  } catch (e: any) {
    logger.error(e);
  }
}

export async function getUserAuctions(query: FilterQuery<AuctionDocument>) {
  return AuctionModel.find(query).lean();
}

export async function deleteAuction(query: FilterQuery<AuctionDocument>) {
  try {
    const sanitizedQuery = sanitize(query);
    return await AuctionModel.deleteOne(sanitizedQuery);
  } catch (e: any) {
    logger.error(e);
  }
}

export async function searchAuctionById(id: string, options: QueryOptions = {lean: true}) {
  try {

    return await AuctionModel.findOne({auctionId: id}, {}, options)
        .populate({
          path: "book",
          select: {"_id":0, "__v": 0}
        })
        .populate({
          path: "seller",
          select: {"email":1, "_id":1}
        });
  } catch (e:any) {
    logger.error(`Failed to find auction by ID: ${e.message}`);
    throw new Error("Error retrieving auction");
  }
}

export async function searchAuctions(query: FilterQuery<AuctionDocument>, options: QueryOptions = {lean: true}) {
  try {
    const sanitizedQuery = sanitize(query);
    return await AuctionModel.find(sanitizedQuery, {}, options)
        .populate({
          path: "book",
          select: {"_id":0, "__v": 0}
        })
        .populate({
          path: "seller",
          select: {"email":1, "_id":1}
        });
  } catch (e:any) {
    logger.error(e);
  }
}

export async function setWinner(winner: BidDocument) {
    try {
        const updatedAuction = await AuctionModel.findOneAndUpdate(
        { auctionId: winner.auctionId },
        { winner: winner.buyer },
        { new: true }
    ).exec();
    } catch (e:any) {
        logger.error(e);
    }
}