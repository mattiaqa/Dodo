import { Request, Response } from "express";
import { GetBidsInput, PlaceBidInput, placeBidSchema } from '../schema/bid.schema'
import {searchAuctionById, updateAuction} from '../service/auction.service'
import { placeBid, getBids } from '../service/bid.service'
import { findUser, findUsers } from "../service/user.service";

import { omit, pick } from "lodash";
import logger from "../utils/logger";
import moment from "moment-timezone";
import { z } from "zod";

export async function placeBidHandler(req: Request<{}, {}, z.infer<typeof placeBidSchema>>, res: Response) {
    try {
        const { auctionId, amount } = req.body;
        const userId = res.locals.user!._id;

        const auction = await searchAuctionById(auctionId);
        if (!auction) {
            res.status(404).send({"Error": "Auction not found"});
            return;
        }

        if (auction.seller._id == userId) {
            res.status(403).send({"Error": 'You cannot place a bid on your auction'});
            return;
        }

        if (amount <= auction.lastBid) {
            res.status(400).send({"Error":"Bid must be greater than the current highest bid"});
            return;
        }

        const now = new Date();
        if(now > auction.expireDate) {
            res.status(400).send({"Error": "You cannot bid on expired auctions"});
            return;
        }

        const bid = await placeBid(userId, req.body);
        res.send({"Message" : "Bid placed successfully", bid});

    } catch (e: any) {
        logger.error(e);
        res.status(500).send({"Error": "Internal Server Error"});
    }
}


export async function getBidsHandler(req: Request, res: Response) {
    try {
        const { auctionId } = req.params;
        if(!auctionId){
            res.status(400).send({message: 'You need to specify an auction'})
            return;
        }

        // Verifica se l'asta esiste
        const auction = await searchAuctionById(auctionId);
        if (!auction) {
            res.status(404).send({ "Error": "No auction found" });
            return;
        }

        // Recupera le offerte relative all'asta
        const bids = await getBids({ auctionId });

        if (!bids || bids.length === 0) {
            res.status(200).send([]); // Nessuna offerta trovata
            return;
        }

        // Ottieni gli ID dei compratori
        const buyerIds = bids.map(bid => bid.buyer);

        // Recupera tutti i compratori in un'unica query
        const buyers = await findUsers({ _id: { $in: buyerIds } });

        // Crea una mappa degli utenti per accesso rapido
        const buyerMap = buyers.reduce((result, buyer) => {
            result[buyer._id.toString()] = pick(buyer, ["name", '_id']);
            return result;
        }, {} as Record<string, any>);

        // Arricchisci le offerte con i dettagli dei compratori
        const bidsWithBuyer = bids.map(bid => {
            const date = moment(bid.createdAt).tz("Europe/Rome").format("YYYY-MM-DD");

            return {
                ...pick(bid, ["amount"]),
                date
            }
        });

        res.status(200).send(bidsWithBuyer);
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}
