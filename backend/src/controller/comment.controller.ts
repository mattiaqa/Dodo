import { Request, Response } from "express";
import logger from "../utils/logger";
import { getAuctionById } from "../service/auction.service";
import { getUserById } from "../service/user.service";
import { addComment, getComments } from "../service/comment.service";
import moment from "moment";
import { omit } from "lodash";

/**
 * Handler to add a comment to a specific auction.
 *
 * Process:
 * - Verifies that the auction exists.
 * - Verifies that the user exists.
 * - Creates a new comment linked to the auction and the user.
 * - Returns a success message if the comment is added successfully.
 * - Handles errors and returns an internal server error message if any occur.
 */
export const addCommentHandler = async (req: Request, res: Response) => {
    const { auctionId } = req.params;
    const { comment } = req.body;

    try {
        // Check if the auction exists
        const auctionExists = await getAuctionById(auctionId);
        if (!auctionExists) {
            res.status(404).send({ message: "Auction not found" });
            return;
        }

        const user = await getUserById(res.locals.user!.id);
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        // Create the comment
        await addComment({
            auction: auctionExists.auctionId,
            username: user.name,
            userId: user.id,
            comment,
        });

        res.status(201).send({ message: "Comment added successfully" });
        return;
    } catch (error: any) {
        logger.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

/**
 * Handler to retrieve all comments for a specific auction.
 *
 * Process:
 * - Fetches the comments associated with the auction.
 * - If no comments are found, returns a message indicating no comments are available.
 * - Formats the creation date of each comment to the "Europe/Rome" timezone.
 * - Retrieves the avatar of the user who made each comment.
 * - Returns the formatted comments along with user avatars.
 * - Handles errors and returns an internal server error message if any occur.
 */
export const getCommentsHandler = async (req: Request, res: Response) => {
    const { auctionId } = req.params;

    try {
        const comments = await getComments({ auction: auctionId });

        if (comments.length === 0) {
            res.status(404).send({ message: "No comments found for this auction" });
            return;
        }

        const commentsWithTimezone = comments.map(comment => {
            const formattedCreatedAt = moment(comment.createdAt)
                .tz("Europe/Rome")
                .format();

            return omit({
                ...comment,
                createdAt: formattedCreatedAt,
            }, ["updatedAt", "__v"]);
        });

        const commentsWithAvatar = await Promise.all(
            commentsWithTimezone.map(async (comment) => {
                const user = await getUserById(comment.userId as string);
                const avatar = user ? (user.avatar || user.defaultAvatar) : null;
                return {
                    ...comment,
                    avatar
                };
            })
        );

        res.status(200).send(commentsWithAvatar);
        return;
    } catch (error: any) {
        logger.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
