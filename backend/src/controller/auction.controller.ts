import {Request, Response} from "express";
import {
    createAuction,
    deleteAuction,
    searchAuctionById,
    searchAuctions,
    getUserAuctions,
    incrementInteraction, incrementViews
} from "../service/auction.service";
import logger from "../utils/logger";
import {CreateAuctionInput, SearchAuctionInput} from "../schema/auction.schema";
import {createBook, searchBookByISBN} from "../service/book.service";
import {omit, pick} from "lodash";
import sanitize from "mongo-sanitize";
import mongoose, { FilterQuery } from "mongoose";
import { AuctionDocument } from "../models/auction.model";

export async function createAuctionHandler(req: Request<{}, {}, CreateAuctionInput["body"]>, res: Response) {
    try {
        const userId = res.locals.user._id;
        const body = req.body;
        let inputBook = body.book;

        let book = await searchBookByISBN(inputBook.ISBN);

        if (!book) {
            // TODO: fix this
            await createBook(inputBook);
        }

        book = await searchBookByISBN(inputBook.ISBN);

        const auction = await createAuction({...body, seller: userId, book: book?._id});
        res.send(auction);
    } catch (e: any) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

export async function getUserAuctionsHandler(req: Request, res: Response) {
    const seller = res.locals.user._id;
  
    try {
      const auctions = await getUserAuctions({ seller });
  
      if(!auctions) {
        res.status(404).send({"Error": "The user has not yet created any auctions"});
        return;
      }
  
      res.send(auctions);
    } catch (e: any) {
      logger.error(e);
      res.status(500).send({message: "Internal Server Error"});
    }
}

export async function getAuctionHandler(req: Request, res: Response) {
    const auctionId = req.params.auctionId;
    try{
        const auction = await searchAuctionById(auctionId);

        if (!auction) {
            res.status(404).send({"Error": "No auction found"});
            return;
        }

        await incrementInteraction(auctionId);

        res.send(auction);
    } catch (e) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

export async function getAllAuctionHandler(req: Request, res: Response) {
    try {
        // Estrai i parametri di query
        const { bookId, minPrice, maxPrice, sellerId, where, ISBN } = req.query;

        // Costruisci la query dinamicamente
        const query: FilterQuery<AuctionDocument> = {};

        if (where) {
            query.country = { $regex: `.*${sanitize(where)}.*`, $options: 'i' };
        }
        /*
        if (ISBN) {
            query.isbn = sanitize(ISBN);
        }
        */
        if (bookId) {
            if (mongoose.Types.ObjectId.isValid(bookId as string)) {
                query.book = new mongoose.Types.ObjectId(bookId as string); // Converte il parametro bookId in ObjectId
            } else {
                res.status(400).send({ message: "Invalid book ID format" });
                return;
            }
        }
        if (minPrice) {
            query.lastBid = { ...query.lastBid, $gte: parseFloat(minPrice as string) }; // Prezzo minimo
        }
        if (maxPrice) {
            query.lastBid = { ...query.lastBid, $lte: parseFloat(maxPrice as string) }; // Prezzo massimo
        }
        if (sellerId) {
            query.seller = sellerId; // Filtra per ID venditore
        }

        // Recupera le aste
        const auctions = await searchAuctions(query);

        if (!auctions || auctions.length == 0) {
            res.status(404).send({ message: "No auctions found" });
            return;
        }

        const now = new Date();
        const validAuctions = auctions.filter(auction => {
            const expirationDate = new Date(auction.expireDate);
            return expirationDate > now;
        });
        const filteredAuctions = validAuctions.map(auction =>
            pick(auction, ["book", "country", "expireDate", "auctionId", "lastBid"])
        );

        res.status(200).send({ filteredAuctions });
    } catch (error: any) {
        res.status(500).send({ message: "Internal server error", error: error.message });
    }
}

export async function deleteAuctionHandler(req: Request<{auctionId: string}>, res: Response) {
    const { auctionId } = req.params;
    const auction = await searchAuctionById(auctionId);

    if (!auction) {
        res.sendStatus(404);
        return;
    }

    const deletedAuction = await deleteAuction({auctionId});

    res.status(200).send(deletedAuction);
    return;
}

/*
export async function searchAuctionHandler(req: Request<SearchAuctionInput['body']>, res: Response) {
    const { where, ISBN, budget } = req.body;

    let conditions: any[] = [];

    if (where) {
        conditions.push({ country: { $regex: `.*${sanitize(where)}.*`, $options: 'i' } });
    }
    if (ISBN) {
        conditions.push({ ISBN: sanitize(ISBN) });
    }
    if (budget) {
        const budgetNumber = Number(budget);
        if (!isNaN(budgetNumber)) {
            conditions.push({ lastBid: { $lte: budgetNumber } });
        }
    }
    const query: any = conditions.length > 0 ? { $and: conditions } : {};

    try {
        const now = new Date();

        const auctions = await searchAuctions(
            query
        );

        if (!auctions || auctions.length === 0) {
            res.status(404).send({message: "No auction found"});
            return;
        }

        const validAuctions = auctions!.filter(auction => {
            const expirationDate = new Date(auction.expireDate);
            return expirationDate > now;
        });

        res.send(validAuctions);
    } catch (e) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}
*/