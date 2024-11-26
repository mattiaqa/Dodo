import { Request, Response } from "express";
import { GetBidsInput, PlaceBidInput } from '../schema/bid.schema'
import {searchAuctionById, searchAuctions} from '../service/auction.service'
import { placeBid, getBids } from '../service/bid.service'
import { findUser } from "../service/user.service";

import { omit } from "lodash";
import logger from "../utils/logger";

export async function placeBidHandler(req: Request<{}, {}, PlaceBidInput["body"]>, res: Response) {
    try{
        const auctionId = req.body.auctionId;
        const userId = res.locals.user._id;
        const body = req.body;

        const userData = await findUser({ _id: userId });

        if(userData?.isAdmin) {
            res.sendStatus(403);
            return;
        }

        const auction = await searchAuctionById({ auctionId: auctionId });

        if (!auction) {
            res.sendStatus(404);
            return;
        } 
    
        if(auction.seller == userId) {
            res.sendStatus(403);
            return;
        }
        
        const bid = await placeBid({...body, auctionId, buyer: userId});
        res.send(bid);
        
    } catch (e: any) {
        logger.error(e);
        res.status(409).send(e.message);
      }
}

export async function getBidsHandler(req: Request<GetBidsInput['body']>, res: Response) {
    try {
        const auctionId = req.body.auctionId;

        const auction = await searchAuctionById({ auctionId });

        if (!auction) {
            res.sendStatus(404);
            return;
        }

        const bids = await getBids({ auctionId });

        const bidsWithBuyer = await Promise.all(bids.map(async (bid) => {
            const buyer = await findUser({ _id: bid.buyer }); 
            
            if (!auction) {
                res.sendStatus(404);
                return;
            }

            return omit({
                ...bid,
                buyer: omit(buyer, "password", "_id", "createdAt", "updatedAt", "__v", "email"),  
            }, "auctionId");
        }));

        res.send(bidsWithBuyer);

    } catch (e: any) {
        logger.error(e);
        res.status(409).send(e.message);
    }
}
