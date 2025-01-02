import {Request, Response} from "express";
import {createAuction, deleteAuction, searchAuctionById, searchAuctions, getUserAuctions} from "../service/auction.service";
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
        res.sendStatus(409);
    }
}

export async function getUserAuctionsHandler(req: Request, res: Response) {
    const seller = res.locals.user._id;
  
    try {
      const auctions = await getUserAuctions({ seller });
  
      if(!auctions) {
        res.sendStatus(404);
        return;
      }
  
      res.send(auctions);
    } catch (e: any) {
      logger.error(e);
      res.status(409).send(e.message);
    }
}

export async function getAuctionHandler(req: Request, res: Response) {
    const auctionId = req.params.auctionId;
    const auction = await searchAuctionById({auctionId: auctionId});

    if (!auction) {
        res.sendStatus(404);
        return;
    }

    res.send(auction);
}

export async function getAllAuctionHandler(req: Request, res: Response) {
    const now = new Date();
    const auctions = await searchAuctions({});

    const validAuctions = auctions!.filter(auction => {
        const expirationDate = new Date(auction.expireDate);
        return expirationDate > now;
    });


    if (!validAuctions || validAuctions.length === 0) {
        res.sendStatus(404);
        return;
    }

    const filteredAuctions = validAuctions.map(auction =>
        omit(auction, ["_id", "__v", "updatedAt", "seller", "description"])
    );

    res.send(filteredAuctions);
}

export async function deleteAuctionHandler(req: Request<DeleteAuctionInput['body']>, res: Response) {
    const auctionId = req.body.auctionId;
    const userId = res.locals.user._id;

    const auction = await searchAuctionById({auctionId: auctionId});

    if (!auction) {
        res.sendStatus(404);
        return;
    }

    if (auction.seller != userId) {
        res.sendStatus(403);
        return;
    }

    const deletedAuction = await deleteAuction({auctionId});

    res.send(deletedAuction);
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
        const auctions = await searchAuctions(
            query
        );

        if (!auctions || auctions.length === 0) {
            res.sendStatus(404);
            return;
        }

        res.send(auctions);
    } catch (error) {
        res.sendStatus(500)
    }
}