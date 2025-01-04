import { FilterQuery, QueryOptions } from "mongoose";
import AuctionModel, { AuctionDocument, AuctionInput } from "../models/auction.model";
import logger from "../utils/logger";
import {Task, scheduler} from "../scheduler/scheduler"

import sanitize from "mongo-sanitize";
import {BidDocument} from "../models/bid.model";
import {omit} from "lodash";

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
      throw new Error(e.message);
  }
}

export async function updateAuction(auctionId: string, updateFields: any) {
    try {
        const updatedAuction = await AuctionModel.findOneAndUpdate(
            { auctionId: auctionId },
            { $set: updateFields },
            { new: true }
        );

        if (!updatedAuction) {
            throw new Error("Auction not found.");
        }

        return omit(updatedAuction, "__v", "updatedAt", "createdAt", "buyer");
    } catch (e: any) {
        throw new Error(e.message);
    }
}

export async function incrementInteraction(auctionId: string) {
    try {
        const updatedAuction = await AuctionModel.findOneAndUpdate(
            { auctionId: auctionId },
            { $inc: {interactions: 1} },
            { new: true }
        );

        if (!updatedAuction) {
            throw new Error("Auction not found.");
        }

        return omit(updatedAuction, "__v", "updatedAt", "createdAt", "buyer");
    } catch (e: any) {
        throw new Error(e.message);
    }
}

export async function incrementViews(auctionId: string) {
    try {
        const updatedAuction = await AuctionModel.findOneAndUpdate(
            { auctionId: auctionId },
            { $inc: {views: 1} },
            { new: true }
        );

        if (!updatedAuction) {
            throw new Error("Auction not found.");
        }

        return omit(updatedAuction, "__v", "updatedAt", "createdAt", "buyer");
    } catch (e: any) {
        throw new Error(e.message);
    }
}

export async function getUserAuctions(query: FilterQuery<AuctionDocument>) {
  return AuctionModel.find(query).populate("book");
}

export async function deleteAuction(query: FilterQuery<AuctionDocument>) {
  try {
    const sanitizedQuery = sanitize(query);
    return await AuctionModel.deleteOne(sanitizedQuery);
  } catch (e: any) {
      throw new Error(e.message);
  }
}

export async function searchAuctionById(query: FilterQuery<AuctionDocument>, options: QueryOptions = {lean: true}) {
  try {
      const sanitizedQuery = sanitize(query);
    return await AuctionModel.findOne(sanitizedQuery, {}, options)
        .populate({
          path: "book",
          select: {"_id":0, "__v": 0}
        })
        .populate({
          path: "seller",
          select: {"email":1, "_id":1}
        });
  } catch (e:any) {
      throw new Error(e.message);
  }
}

export async function searchAuctions(query: FilterQuery<AuctionDocument>, options: QueryOptions = {lean: true}) {
  try {
    return await AuctionModel.find(query, {}, options)
        .populate({
          path: "book",
          select: {"title": 1, "ISBN": 1, "_id": 0}
        })
  } catch (e:any) {
      throw new Error(e.message);
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
        throw new Error(e.message);
    }
}