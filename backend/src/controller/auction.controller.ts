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
import {CreateAuctionInput, DeleteAuctionInput, GetAuctionInput, SearchAuctionInput} from "../schema/auction.schema";
import {createBook, searchBookByISBN} from "../service/book.service";
import {omit} from "lodash";
import sanitize from "mongo-sanitize";

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
    try {
        const auctionId = req.params.auctionId;
        const auction = await searchAuctionById({auctionId: auctionId});

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
        const now = new Date();
        const auctions = await searchAuctions({});

        const validAuctions = auctions!.filter(auction => {
            const expirationDate = new Date(auction.expireDate);
            return expirationDate > now;
        });


        if (!validAuctions || validAuctions.length === 0) {
            res.status(404).send({"Error": "There are no auctions yet"});
            return;
        }

        const filteredAuctions = validAuctions.map(auction => {
            incrementViews(auction.auctionId);
            return omit(auction, ["_id", "__v", "updatedAt", "seller", "description"]);
        });

        res.send(filteredAuctions);
    } catch (e) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

export async function deleteAuctionHandler(req: Request<DeleteAuctionInput['body']>, res: Response) {
    try {
        const auctionId = req.body.auctionId;

        const auction = await searchAuctionById({auctionId: auctionId});

        if (!auction) {
            res.status(404).send({message: "No auction found"});
            return;
        }

        const deletedAuction = await deleteAuction({auctionId});

        res.send(deletedAuction);
    } catch (e) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

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