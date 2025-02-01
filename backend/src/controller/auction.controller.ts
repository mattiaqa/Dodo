import { Request, Response } from "express";
import {
    createAuction,
    deleteAuction,
    getAuctionById,
    searchAuctions,
    incrementInteraction,
    updateAuction,
    AUCTIONS_PAGE_SIZE,
} from "../service/auction.service";
import logger from "../utils/logger";
import {
    createAuctionSchema,
    editAuctionSchema,
    getAuctionSchema,
    searchAuctionSchema,
} from "../schema/auction.schema";
import { omit } from "lodash";
import sanitize from "mongo-sanitize";
import mongoose, { FilterQuery } from "mongoose";
import { AuctionDocument } from "../models/auction.model";
import { z } from "zod";
import { unlink } from "fs/promises";
import { saveFilesToDisk } from "../utils/multer";
import { getUserById, updateUser } from "../service/user.service";
import path from "path";
import { createOrGetBook, searchBook } from "../service/book.service";
import { verifyJwt } from "../utils/jwt.utils";
import { BookSchema } from "../schema/book.schema";
import {scanFile} from "../utils/clamAV";

/**
 * Handler to create a new auction.
 *
 * Process:
 * - Retrieves seller's ID from response locals.
 * - Saves any uploaded image files to disk.
 * - If a book is provided, verifies the book JWT, and creates or retrieves the book record.
 * - Calls the auction creation service with provided data and image paths.
 * - Cleans up uploaded files if an error occurs.
 */
export async function createAuctionHandler(
    req: Request<{}, {}, z.infer<typeof createAuctionSchema>>,
    res: Response
) {
    let filename: string[] = [];
    let uploadedImagePath: string[] = [];
    try {
        const seller = res.locals.user!.id;
        const body = req.body;

        if (req.files) {
            const uploadedImages = req.files as Express.Multer.File[];
            const { uploadedFilePaths, uploadedFilename } = await saveFilesToDisk(uploadedImages, 'auctions');

            filename = uploadedFilename;
            uploadedImagePath = uploadedFilePaths

            for (const file of uploadedImagePath) {
                const { isInfected, viruses } = await scanFile(file);
                if (isInfected) {
                    await unlink(file);
                    res.status(400).send({ "Error" : 'File is infected and was removed.' });
                    return;
                }
            }
        }

        let bookId;
        if (body.book) {
            const { decoded, valid, expired } = verifyJwt<BookSchema>(body.book);
            if (decoded) {
                bookId = (await createOrGetBook(decoded))?._id;
            }
        }

        const auction = await createAuction({
            ...body,
            images: filename,
            seller,
            book: bookId,
        });

        res.status(200).send({
            Message: "The auction was created successfully",
            Result: auction,
        });
        return;
    } catch (e: any) {
        // Remove saved files in case of an error
        if (uploadedImagePath.length > 0) {
            for (const filePath of uploadedImagePath) {
                await unlink(filePath).catch((err) =>
                    console.error(`Error deleting file ${filePath}:`, err)
                );
            }
        }
        logger.error(e);
        res.status(500).send({ message: "Internal Server Error" });
    }
}

/**
 * Handler to get details of a single auction.
 *
 * Process:
 * - Extracts the auction ID from the request.
 * - Optionally checks if the logged-in user has liked/saved the auction.
 * - Retrieves the auction using its ID.
 * - Increments the auction's interaction count.
 * - Translates the condition code to a descriptive string.
 * - Shows different reservePrice details depending on if the requester is the seller.
 */
export async function getAuctionHandler(
    req: Request<z.infer<typeof getAuctionSchema>>,
    res: Response
) {
    const { auctionId } = req.params;
    const userId = res.locals.user?.id;
    let userLike = false;
    let user;

    try {
        const auction = await getAuctionById(auctionId);
        if (userId) user = await getUserById(userId);

        if (!auction) {
            res.status(404).send({ Error: "No auction found" });
            return;
        }

        userLike = user ? user.savedAuctions?.includes(auctionId) ?? false : false;

        await incrementInteraction(auctionId);

        const response = {
            ...auction.toObject(),
            userLike,
            condition: translateCondition(auction.condition),
            reservePrice:
                auction.seller === res.locals.user?.id || !auction.reservePrice
                    ? auction.reservePrice
                    : auction.lastBid >= auction.reservePrice
                        ? "Reserve price reached"
                        : "Reserve price not reached yet",
        };
        res.send(response);
    } catch (e) {
        logger.error(e);
        res.status(500).send({ message: "Internal Server Error" });
    }
}

/**
 * Handler to search and return auctions based on query parameters.
 *
 * Process:
 * - Extracts various filtering parameters from the query string.
 * - Constructs a dynamic MongoDB query for auctions.
 * - If book-related fields are provided, searches for matching books and filters auctions accordingly.
 * - Filters auctions by price range and seller if provided.
 * - Only includes auctions that have not expired.
 * - Calculates the total number of matches and pages.
 * - Returns the filtered auctions.
 */
export async function getAllAuctionHandler(
    req: Request<{}, {}, {}, z.infer<typeof searchAuctionSchema>>,
    res: Response
) {
    try {
        const {
            ISBN,
            bookId,
            condition,
            minPrice,
            maxPrice,
            sellerId,
            where,
            auctionTitle,
            bookPublisher,
            bookTitle,
            bookAuthor,
            resultsPage,
        } = req.query;

        const query: FilterQuery<AuctionDocument> = {};
        let bookIds: mongoose.ObjectId[] = [];

        if (where) {
            query.country = { $regex: `.*${sanitize(where)}.*`, $options: "i" };
        }

        if (auctionTitle) {
            query.title = { $regex: `.*${sanitize(auctionTitle)}.*`, $options: "i" };
        }

        if (condition) {
            const validConditions = ["1", "2", "3", "4", "5"];
            if (validConditions.includes(condition)) {
                query.condition = sanitize(condition);
            }
        }

        if (ISBN || bookTitle || bookPublisher || bookAuthor) {
            const books = await searchBook({
                ISBN,
                title: bookTitle,
                publisher: bookPublisher,
                author: bookAuthor,
            });

            // Collect book IDs from found books
            books.forEach((book) => bookIds.push(book.mongoId as mongoose.ObjectId));
            query.book = { $in: bookIds };
        }

        if (minPrice) {
            query.lastBid = { ...query.lastBid, $gte: parseFloat(minPrice as string) };
        }
        if (maxPrice) {
            query.lastBid = { ...query.lastBid, $lte: parseFloat(maxPrice as string) };
        }
        if (sellerId) {
            query.seller = sellerId;
        }

        // Retrieve auctions matching the query with pagination
        const auctions = await searchAuctions(query, parseInt(resultsPage ?? "0"));

        if (!auctions || auctions.length == 0) {
            res.status(200).send({ Matches: 0, pages: 0, Results: [] });
            return;
        }

        const now = new Date();
        // Filter out expired auctions
        const validAuctions = auctions.filter((auction) => {
            const expirationDate = new Date(auction.expireDate);
            return expirationDate > now;
        });
        const filteredAuctions = validAuctions.map((auction) => ({
            ...omit(auction, ["__v", "_id"]),
            condition: translateCondition(auction.condition.toString()),
        }));

        // Calculate total matches and pages
        const auctionsAll = await searchAuctions(query);
        const validAuctionsAll = auctionsAll.filter((auction) => {
            const expirationDate = new Date(auction.expireDate);
            return expirationDate > now;
        });
        const matches = validAuctionsAll.length;
        const pages = Math.ceil(matches / AUCTIONS_PAGE_SIZE);

        res.status(200).send({
            Matches: matches,
            pages,
            Results: filteredAuctions.reverse(),
        });
    } catch (error: any) {
        res
            .status(500)
            .send({ message: "Internal server error", error: error.message });
    }
}

/**
 * Handler to edit/update an existing auction.
 *
 * Process:
 * - Retrieves the auction to be updated by its ID.
 * - Removes images that the user requested to delete from disk.
 * - Saves any new images provided.
 * - Constructs an update object with only the defined fields.
 * - Calls the update service and returns the updated auction with a translated condition.
 */
export async function editAuctionHandler(
    req: Request<
        z.infer<typeof getAuctionSchema>,
        {},
        z.infer<typeof editAuctionSchema>
    >,
    res: Response
) {
    try {
        const auction = await getAuctionById(req.params.auctionId);
        if (!auction) {
            res.status(404).send({ Error: "Auction not found" });
            return;
        }

        // Remove images as requested by the user
        let currentUploadedImages = auction.images ?? [];
        if (req.body.imagesToRemove) {
            for (const image of req.body.imagesToRemove) {
                const absolutePath = path.join(
                    __dirname,
                    "../../public/uploads/auctions/",
                    image
                );
                await unlink(absolutePath).catch((err) =>
                    console.error(`Error deleting file ${absolutePath}:`, err)
                );
            }
            currentUploadedImages = currentUploadedImages.filter(
                (img) => !req.body.imagesToRemove?.includes(img)
            );
        }

        // Save any new uploaded images and add them to the current list
        if (req.files) {
            const uploadedImages = req.files as Express.Multer.File[];
            currentUploadedImages = currentUploadedImages.concat(
                await saveFilesToDisk(uploadedImages, "auctions")
            );
        }

        // Construct update object with fields to be updated
        const updateFields = {
            title: req.body.title,
            description: req.body.description,
            book: req.body.book,
            images: currentUploadedImages,
        };

        // Remove undefined fields from updateFields
        const filteredUpdateFields = Object.fromEntries(
            Object.entries(updateFields).filter(([_, value]) => value !== undefined)
        );

        if (Object.keys(filteredUpdateFields).length === 0) {
            res.status(400).send({ message: "No valid fields to update." });
            return;
        }
        // Update auction with valid fields
        const updatedAuction = await updateAuction(
            req.params.auctionId,
            filteredUpdateFields
        );
        updatedAuction.condition = translateCondition(updatedAuction.condition);

        res.status(200).send({
            message: "Auction updated successfully",
            result: updatedAuction,
        });
    } catch (e: any) {
        res
            .status(500)
            .send({ message: e.message || "Error updating auction" });
    }
}

/**
 * Handler to delete an auction.
 *
 * Process:
 * - Retrieves the auction by its ID.
 * - Deletes any image files associated with the auction from disk.
 * - Calls the delete service for the auction.
 */
export async function deleteAuctionHandler(
    req: Request<z.infer<typeof getAuctionSchema>>,
    res: Response
) {
    try {
        const { auctionId } = req.params;
        const auction = await getAuctionById(auctionId);

        if (!auction) {
            res.status(404).send({ Error: "Auction not found" });
            return;
        }
        if (auction.images) {
            for (const image of auction.images) {
                const absolutePath = path.join(
                    __dirname,
                    "../../public/uploads/auctions/",
                    image
                );
                await unlink(absolutePath).catch((err) =>
                    console.error(`Error deleting file ${absolutePath}:`, err)
                );
            }
        }
        await deleteAuction({ auctionId });

        res.status(200).send({ Message: "Auction deleted successfully" });
        return;
    } catch (e: any) {
        res
            .status(500)
            .send({ message: e.message || "Error deleting auction" });
    }
}

/**
 * Handler to "like" an auction (save it to the user's favorites).
 *
 * Process:
 * - Retrieves the auction by its ID.
 * - Updates the user record to add the auction ID to the savedAuctions list.
 */
export async function likeAuctionHandler(req: Request, res: Response) {
    const auctionId = req.params.auctionId;
    const userId = res.locals.user!.id;

    try {
        const auction = await getAuctionById(auctionId);

        if (!auction) {
            res.status(404).send({ Error: "No auction found" });
            return;
        }

        await updateUser({ _id: userId }, { $push: { savedAuctions: auction.auctionId } });

        res.status(200).send({ Message: "Auction liked successfully" });
    } catch (e) {
        logger.error(e);
        res.status(500).send({ message: "Internal Server Error" });
    }
}

/**
 * Handler to "dislike" an auction (remove it from the user's favorites).
 *
 * Process:
 * - Retrieves the auction by its ID.
 * - Updates the user record to remove the auction ID from the savedAuctions list.
 */
export async function dislikeAuctionHandler(req: Request, res: Response) {
    const auctionId = req.params.auctionId;
    const userId = res.locals.user!.id;

    try {
        const auction = await getAuctionById(auctionId);

        if (!auction) {
            res.status(404).send({ Error: "No auction found" });
            return;
        }

        await updateUser({ _id: userId }, { $pull: { savedAuctions: auction.auctionId } });

        res.status(200).send({ Message: "Auction liked successfully" });
    } catch (e) {
        logger.error(e);
        res.status(500).send({ message: "Internal Server Error" });
    }
}

/**
 * Helper function to translate a condition number (as a string) into a descriptive condition.
 *
 * Mapping:
 * - "1": 'New'
 * - "2": 'As good as new'
 * - "3": 'Great condition'
 * - "4": 'Acceptable condition'
 * - "5": 'Condition'
 */
function translateCondition(number: string): string {
    let translatedCondition = "";
    switch (number) {
        case "1":
            translatedCondition = "New";
            break;
        case "2":
            translatedCondition = "As good as new";
            break;
        case "3":
            translatedCondition = "Great condition";
            break;
        case "4":
            translatedCondition = "Acceptable condition";
            break;
        case "5":
            translatedCondition = "Condition";
            break;
        default:
            break;
    }
    return translatedCondition;
}
