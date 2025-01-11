import {Request, Response} from "express";
import {
    createAuction,
    deleteAuction,
    searchAuctionById,
    searchAuctions,
    getUserAuctions,
    incrementInteraction, incrementViews,
    updateAuction
} from "../service/auction.service";
import logger from "../utils/logger";
import { createAuctionSchema, editAuctionSchema, getAuctionSchema, SearchAuctionInput, searchAuctionSchema} from "../schema/auction.schema";
import { pick} from "lodash";
import sanitize from "mongo-sanitize";
import mongoose, { FilterQuery } from "mongoose";
import { AuctionDocument } from "../models/auction.model";
import { z } from "zod";
import { unlink } from "fs/promises";
import { saveFilesToDisk } from "../utils/multer";

export async function createAuctionHandler(req: Request<{}, {}, z.infer<typeof createAuctionSchema>>, res: Response) {
    let uploadedImagesPaths: string[] = [];
    try {
        const seller = res.locals.user!.id;
        const body = req.body;

        const uploadedImages = req.files as Express.Multer.File[]; // Le immagini caricate
        uploadedImagesPaths = await saveFilesToDisk(uploadedImages, 'auctions'); // Salva i file nel file system
        
        const auction = await createAuction({...body, images: uploadedImagesPaths, seller});
        
        res.status(200).send({
            "Message":"The auction was created successfully",
            "Warning":"Please consider adding a book tag, to make your auction easier to find",
            "Result": auction
        });
        return;
    } catch (e: any) {
        // Rimuovi i file salvati in caso di errore
        if (uploadedImagesPaths.length > 0) {
            for (const filePath of uploadedImagesPaths) {
                await unlink(filePath).catch((err) => console.error(`Error deleting file ${filePath}:`, err));
            }
        }
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

export async function getAllAuctionHandler(req: Request<{},{},{}, z.infer<typeof searchAuctionSchema>>, res: Response) {
    try {
        // Estrai i parametri di query
        const { ISBN, bookId, minPrice, maxPrice, sellerId, where } = req.query;

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

export async function editAuctionHandler(req: Request<z.infer<typeof getAuctionSchema>, {}, z.infer<typeof editAuctionSchema>>, res: Response)
{
    try {
        // Crea l'oggetto dei campi da aggiornare
        const updateFields = {
            title: req.body.title,
            description: req.body.description,
            book: req.body.book
        };

        // Filtra i campi undefined
        const filteredUpdateFields = Object.fromEntries(
            Object.entries(updateFields).filter(([_, value]) => value !== undefined)
        );

        if (Object.keys(filteredUpdateFields).length === 0) {
            res.status(400).send({ message: "No valid fields to update." });
            return;
        }

        // Passa i campi validi a updateAuction
        const auction = await updateAuction(req.params.auctionId, filteredUpdateFields);

        res.status(200).send({
            message: "Auction updated successfully",
            result: auction
        });
    } catch (e: any) {
        res.status(500).send({ message: e.message || "Error updating auction" });
    }
}

export async function deleteAuctionHandler(req: Request<z.infer<typeof getAuctionSchema>>, res: Response) {
    try{
        const { auctionId } = req.params;
        const auction = await searchAuctionById(auctionId);

        if (!auction) {
            res.status(404).send({"Error": "Auciton not found"});
            return;
        }

        const deletedAuction = await deleteAuction({auctionId});

        res.status(200).send({"Message": "Auction deleted successfully", deletedAuction});
        return;
    } catch (e: any) {
        res.status(500).send({ message: e.message || "Error deleting auction" });
    }
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