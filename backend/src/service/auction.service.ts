import { FilterQuery, QueryOptions } from "mongoose";
import AuctionModel, { AuctionDocument, AuctionInput } from "../models/auction.model";
import logger from "../utils/logger";
import {Task, scheduler} from "../scheduler/scheduler"

import sanitize from "mongo-sanitize";
import {BidDocument} from "../models/bid.model";
import {omit, pick} from "lodash";

type PopulatedAuction = Omit<AuctionDocument, "book" | "seller"> & {
  book: {
    title: string;
    ISBN: string;
    authors: string[];
  }; // Puoi aggiungere altri campi se necessario
  seller: {
    email: string;
    _id: string;
  };
};

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
            { new: true, runValidators: true  }
        );

        if (!updatedAuction) {
            throw new Error("Auction not found.");
        }

        return omit(updatedAuction, "__v", "updatedAt", "createdAt");
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

        return omit(updatedAuction, "__v", "updatedAt", "createdAt");
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

        return omit(updatedAuction, "__v", "updatedAt", "createdAt");
    } catch (e: any) {
        throw new Error(e.message);
    }
}

export async function getUserAuctions(query: FilterQuery<AuctionDocument>) {
  return AuctionModel.find(query).populate({path: "book", select: {"title": 1}});
}

export async function deleteAuction(query: FilterQuery<AuctionDocument>) {
  try {
    const sanitizedQuery = sanitize(query);
    return await AuctionModel.deleteOne(sanitizedQuery);
  } catch (e: any) {
      throw new Error(e.message);
  }
}

export async function getAuctionById(id: string) : Promise<PopulatedAuction | null>
{
  try {
    const query: FilterQuery<AuctionDocument> = { auctionId: id };
    const sanitizedQuery = sanitize(query);
    const result =  await AuctionModel.findOne(sanitizedQuery)
      .populate({
        path: "book",
        select: {_id: 0, __v: 0}
      })
      .populate({
        path: "seller",
        select: {email: 1, _id: 1}
      });

    return result as unknown as PopulatedAuction;
  } catch (e:any) {
    logger.error(`Failed to find auction by ID: ${e.message}`);
    throw new Error(e.message);
  }
}

/*export async function searchAuctionByQuery(query: FilterQuery<AuctionDocument>, auth: boolean = false, options: QueryOptions = {lean: true}) {
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
}*/

export const AUCTIONS_PAGE_SIZE = 10;
export async function searchAuctions(query: FilterQuery<AuctionDocument>, page: number = 0, options: QueryOptions = {lean: true}) {
  try {
    if(page >= 1){
      return await AuctionModel.find(query, {}, options)
          .populate({
            path: "book",
            select: { "title": 1, "ISBN": 1, "authors": 1, "publisher": 1 }
          }).skip((page - 1) * AUCTIONS_PAGE_SIZE).limit(AUCTIONS_PAGE_SIZE)
    }
    else{
      return await AuctionModel.find(query, {}, options)
      .populate({
        path: "book",
        select: { "title": 1, "ISBN": 1, "authors": 1, "publisher": 1 }
      })
    }
  } catch (e:any) {
      throw new Error(e.message);
  }
}

export async function setWinner(winner: BidDocument) {
    try {
         await AuctionModel.findOneAndUpdate(
            { auctionId: winner.auctionId },
            { winner: winner.buyer }
        ).exec();
    } catch (e:any) {
        throw new Error(e.message);
    }
}

export async function getAuctionByIdUnpopulated(id: string)
{
    try {
        const query: FilterQuery<AuctionDocument> = { auctionId: id };
        const result = await AuctionModel.findOne(query);

        return result as unknown as AuctionDocument;
    } catch (e:any) {
        logger.error(`Failed to find auction by ID: ${e.message}`);
        throw new Error(e.message);
    }
}