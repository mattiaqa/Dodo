import { Request, Response } from "express";
import {createAuction, deleteAuction, searchAuctionById, searchAuctions} from "../service/auction.service";

import logger from "../utils/logger";

import {
  CreateAuctionInput,
  DeleteAuctionInput,
  GetAuctionInput,
  SearchAuctionInput
} from "../schema/auction.schema";

import {createBook, searchBookByISBN} from "../service/book.service";

export async function createAuctionHandler( req: Request<{}, {}, CreateAuctionInput["body"]>, res: Response) {
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

export async function getAuctionHandler(req: Request<GetAuctionInput['body']>, res: Response){
  const auctionId = req.body.auctionId;
  const auction = await searchAuctionById({ auctionId: auctionId });

  if (!auction) {
    res.sendStatus(404);
    return;
  }

  res.send(auction);
}

export async function getAllAuctionHandler(req: Request, res: Response){
  const auctions = await searchAuctions({});

  if (!auctions) {
    res.sendStatus(404);
    return;
  }

  res.send(auctions);
}

export async function deleteAuctionHandler(req: Request<DeleteAuctionInput['body']>, res: Response){
  const auctionId = req.body.auctionId;
  const userId = res.locals.user._id;

  const auction = await searchAuctionById({ auctionId: auctionId });

  if (!auction) { 
    res.sendStatus(404);
    return;
  } 

  if(auction.seller != userId) {
    res.sendStatus(403);
    return;
  }

  const deletedAuction = await deleteAuction({ auctionId });

  res.send(deletedAuction);
}

export async function searchAuctionHandler(req: Request<SearchAuctionInput['body']>, res: Response) {
  const query = req.body.query;
  const auction = await searchAuctions({title: { $regex: `.*${query}.*` }});
  
  if(!auction) {
    res.sendStatus(404);
    return;
  }

  res.send(auction);
}