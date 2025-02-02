import { Request, Response } from "express";
import { getBidsSchema, placeBidSchema } from "../schema/bid.schema";
import { placeBid, getBids } from "../service/bid.service";
import { findUsers } from "../service/user.service";
import { pick } from "lodash";
import logger from "../utils/logger";
import moment from "moment-timezone";
import { z } from "zod";
import { getAuctionById } from "../service/auction.service";

/**
 * Handler to place a bid on an auction.
 *
 * Process:
 * - Validates that the auction exists and is not expired.
 * - Ensures that users cannot bid on their own auctions.
 * - Checks that the bid amount is greater than the current highest bid.
 * - Calls the service to place the bid and returns the result.
 */
export async function placeBidHandler(
    req: Request<z.infer<typeof getBidsSchema>, {}, z.infer<typeof placeBidSchema>>,
    res: Response
) {
    try {
        const { amount } = req.body;
        const { auctionId } = req.params;
        const userId = res.locals.user!.id;

        const auction = await getAuctionById(auctionId);
        if (!auction) {
            res.status(404).send({ Error: "Auction not found" });
            return;
        }

        if (auction.seller._id == userId) {
            res.status(403).send({ Error: "You cannot place a bid on your auction" });
            return;
        }

        if (amount <= auction.lastBid) {
            res.status(400).send({ Error: "Bid must be greater than the current highest bid" });
            return;
        }

        const now = new Date();
        if (now > auction.expireDate) {
            res.status(400).send({ Error: "You cannot bid on expired auctions" });
            return;
        }

        const bid = await placeBid(userId, auctionId, amount);
        res.send({ Message: "Bid placed successfully", bid });
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({ Error: "Internal Server Error" });
    }
}

/**
 * Handler to retrieve bids for a specific auction.
 *
 * Process:
 * - Validates the existence of the auction.
 * - Fetches bids associated with the auction.
 * - Retrieves buyer details for each bid.
 * - Formats bid information, including date and buyer details.
 */
export async function getBidsHandler(req: Request, res: Response) {
    try {
        const { auctionId } = req.params;
        if (!auctionId) {
            res.status(400).send({ message: "You need to specify an auction" });
            return;
        }

        // Verify if the auction exists
        const auction = await getAuctionById(auctionId);
        if (!auction) {
            res.status(404).send({ Error: "No auction found" });
            return;
        }

        // Retrieve bids related to the auction
        const bids = await getBids({ auctionId });

        if (!bids || bids.length === 0) {
            res.status(200).send([]); // No bids found
            return;
        }

        // Extract buyer IDs from bids
        const buyerIds = bids.map((bid) => bid.buyer);

        // Fetch all buyers in a single query
        const buyers = await findUsers({ _id: { $in: buyerIds } });

        // Create a map for quick access to user details
        const buyerMap = buyers?.reduce((result, buyer) => {
            result[buyer.id!.toString()] = pick(buyer, ["name", "_id"]);
            return result;
        }, {} as Record<string, any>);

        // Enrich bids with buyer details and format the date
        const bidsWithBuyer = bids.map((bid) => {
            const date = moment(bid.createdAt).tz("Europe/Rome").format("YYYY-MM-DD");

            return {
                ...pick(bid, ["amount"]),
                date,
            };
        });

        res.status(200).send(bidsWithBuyer);
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({ message: "Internal Server Error" });
    }
}
