import {Request, Response} from "express";
import {
    createAuction,
    deleteAuction,
    getAuctionById,
    searchAuctions,
    incrementInteraction,
    updateAuction
} from "../service/auction.service";
import logger from "../utils/logger";
import { createAuctionSchema, editAuctionSchema, getAuctionSchema, searchAuctionSchema} from "../schema/auction.schema";
import { pick} from "lodash";
import sanitize from "mongo-sanitize";
import mongoose, { FilterQuery } from "mongoose";
import { AuctionDocument } from "../models/auction.model";
import { z } from "zod";
import { unlink } from "fs/promises";
import { saveFilesToDisk } from "../utils/multer";
import {getUserById, updateUser} from "../service/user.service"
import path from "path";
import { createOrGetBook, searchBook } from "../service/book.service";
import { verifyJwt } from "../utils/jwt.utils";
import { BookSchema } from "../schema/book.schema";


export async function createAuctionHandler(req: Request<{}, {}, z.infer<typeof createAuctionSchema>>, res: Response) {
    let uploadedImagesPaths: string[] = [];
    try {
        const seller = res.locals.user!.id;
        const body = req.body;

        if(req.files)
        {
            const uploadedImages = req.files as Express.Multer.File[]; // Le immagini caricate
            uploadedImagesPaths = await saveFilesToDisk(uploadedImages, 'auctions'); // Salva i file nel file system
        }
        
        let bookId;
        if(body.book)
        {
            const { decoded, valid, expired } = verifyJwt<BookSchema>(body.book);
            if(decoded)
            {
                bookId = (await createOrGetBook(decoded))?._id;
            }
        }

        const auction = await createAuction({...body, images: uploadedImagesPaths, seller, book: bookId});

        res.status(200).send({
            "Message":"The auction was created successfully",
            //"Warning":"Please consider adding a book tag, to make your auction easier to find",
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

export async function getAuctionHandler(req: Request<z.infer<typeof getAuctionSchema>>, res: Response) {
    const { auctionId } = req.params;
    const userId = res.locals.user?.id;
    let userLike = false;
    let user;

    try {
        const auction = await getAuctionById(auctionId);
        if(userId)
            user = await getUserById(userId);

        if (!auction) {
            res.status(404).send({"Error": "No auction found"});
            return;
        }

        userLike = user ? user.savedAuctions?.includes(auctionId) ?? false : false;

        await incrementInteraction(auctionId);

        const response = {
            ...auction.toObject(),
            userLike,
            reservePrice: auction.seller === res.locals.user?.id || !auction.reservePrice
                ? auction.reservePrice // Proprietario vede il valore esatto
                : auction.lastBid >= auction.reservePrice
                    ? "Prezzo di riserva raggiunto"
                    : "Prezzo di riserva non raggiunto"

        }
        res.send(response);

    } catch (e) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

export async function getAllAuctionHandler(req: Request<{},{},{}, z.infer<typeof searchAuctionSchema>>, res: Response) {
    try {
        // Estrai i parametri di query
        const { ISBN, bookId, minPrice, maxPrice, sellerId, where, auctionTitle, bookPublisher, bookTitle, bookAuthor } = req.query;

        // Costruisci la query dinamicamente
        const query: FilterQuery<AuctionDocument> = {};
        let bookIds: mongoose.ObjectId[] = [];

        if (where) {
            query.country = { $regex: `.*${sanitize(where)}.*`, $options: 'i' };
        }

        /*
        if (bookId) {
            if (mongoose.Types.ObjectId.isValid(bookId as string)) {
                query.book = new mongoose.Types.ObjectId(bookId as string); // Converte il parametro bookId in ObjectId
            } else {
                res.status(400).send({ message: "Invalid book ID format" });
                return;
            }
        }
        */
        // Filtra per bookId (array)

        if (ISBN || bookTitle || bookPublisher || bookAuthor) {
            const books = await searchBook({
                ISBN,
                title: bookTitle,
                publisher: bookPublisher,
                author: bookAuthor
            });

            // Filtra le aste per i books trovati
            books.forEach(book => bookIds.push(book.mongoId as mongoose.ObjectId));
            query.book = { $in: bookIds }; // Usa $in per cercare tutte le aste con questi bookId
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
            pick(auction, ["book", "country", "expireDate", "auctionId", "lastBid", "province", "condition", "createdAt", "images"])
        );

        res.status(200).send({"Matches": filteredAuctions.length, "Results": filteredAuctions});
    } catch (error: any) {
        res.status(500).send({ message: "Internal server error", error: error.message });
    }
}

export async function editAuctionHandler(req: Request<z.infer<typeof getAuctionSchema>, {}, z.infer<typeof editAuctionSchema>>, res: Response)
{
    try {

        const auction = await getAuctionById(req.params.auctionId);
        if (!auction) {
            res.status(404).send({"Error": "Auciton not found"});
            return;
        }

        //rimozione immagini
        let currentUploadedImages = auction.images ?? [];
        if(req.body.imagesToRemove)
        {
            for (const image of req.body.imagesToRemove) {
                const absolutePath = path.join(__dirname, "../../public/uploads/auctions/", image);
                await unlink(absolutePath).catch((err) => console.error(`Error deleting file ${absolutePath}:`, err));
            }
            currentUploadedImages = currentUploadedImages.filter((img) => !(req.body.imagesToRemove?.includes(img)));
        }

        //aggiunta immagini
        if(req.files)
        {
            const uploadedImages = req.files as Express.Multer.File[]; // Le immagini caricate
            currentUploadedImages = currentUploadedImages.concat( await saveFilesToDisk(uploadedImages, 'auctions') ); // Salva i file nel file system
        }

        // Crea l'oggetto dei campi da aggiornare
        const updateFields = {
            title: req.body.title,
            description: req.body.description,
            book: req.body.book,
            images: currentUploadedImages
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
        const updatedAuction = await updateAuction(req.params.auctionId, filteredUpdateFields);

        res.status(200).send({
            message: "Auction updated successfully",
            result: updatedAuction
        });
    } catch (e: any) {
        res.status(500).send({ message: e.message || "Error updating auction" });
    }
}

export async function deleteAuctionHandler(req: Request<z.infer<typeof getAuctionSchema>>, res: Response) {
    try{
        const { auctionId } = req.params;
        const auction = await getAuctionById(auctionId);

        if (!auction) {
            res.status(404).send({"Error": "Auciton not found"});
            return;
        }
        if(auction.images)
        {
            for (const image of auction.images) {
                const absolutePath = path.join(__dirname, "../../public/uploads/auctions/", image);
                await unlink(absolutePath).catch((err) => console.error(`Error deleting file ${absolutePath}:`, err));
            }
        }
        const deletedAuction = await deleteAuction({auctionId});

        res.status(200).send({"Message": "Auction deleted successfully"});
        return;
    } catch (e: any) {
        res.status(500).send({ message: e.message || "Error deleting auction" });
    }
}

export async function likeAuctionHandler(req: Request, res: Response) {
    const auctionId = req.params.auctionId;
    const userId = res.locals.user!.id;

    try{
        const auction = await getAuctionById(auctionId);

        if (!auction) {
            res.status(404).send({"Error": "No auction found"});
            return;
        }

        await updateUser({ _id: userId }, {$push: { savedAuctions: auction.auctionId } });

        res.status(200).send({"Message": "Auction liked successfully"});
    } catch (e) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

export async function dislikeAuctionHandler(req: Request, res: Response) {
    const auctionId = req.params.auctionId;
    const userId = res.locals.user!.id;

    try{
        const auction = await getAuctionById(auctionId);

        if (!auction) {
            res.status(404).send({"Error": "No auction found"});
            return;
        }

        await updateUser({ _id: userId }, { $pull: { savedAuctions: auction.auctionId } });

        res.status(200).send({"Message": "Auction liked successfully"});
    } catch (e) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}