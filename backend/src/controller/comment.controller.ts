import { Request, Response } from "express";
import logger from "../utils/logger";
import { searchAuctionById } from "../service/auction.service";
import { findUser } from "../service/user.service";
import { addComment, getComments } from "../service/comment.service";
import moment from "moment";
import { omit } from "lodash";

export const addCommentHandler = async (req: Request, res: Response) => {
    const { auctionId } = req.params;
    const { comment } = req.body;

    try {
        // Controlla che l'asta esista
        const auctionExists = await searchAuctionById(auctionId);
        if (!auctionExists) {
            res.status(404).send({ message: "Auction not found" });
            return;
        }
        
        const user = await findUser({_id: res.locals.user!.id});
        if(!user)
        {
            res.status(404).send({ message: "User not found" });
            return;
        }
        
        // Crea il commento
        addComment({
            auction: auctionExists.auctionId,
            username: user.name,
            profileImage: user.avatar!,
            comment,
        });

        res.status(201).send({ message: "Comment added successfully" });
        return;
    } catch (error: any) {
        logger.error(error);
        res.status(500).send({message: "Internal Server Error"});
    }
};


export const getCommentsHandler = async (req: Request, res: Response) => {
    const { auctionId } = req.params;

    try {

        const comments = await getComments({ auction: auctionId });

        if (comments.length == 0) {
            res.status(404).send({ message: "No comments found for this auction" });
            return;
        }

        const commentsWithTimezone = comments.map(comment => {
            const formattedCreatedAt = moment(comment.createdAt)
                .tz("Europe/Rome")  // Converte la data in orario di Roma
                .format(); // Formatta la data nel formato ISO string

            // Rimuove i campi `updatedAt` e `__v`, e modifica la data `createdAt` alla timezone di Roma
            return omit({
                ...comment,
                createdAt: formattedCreatedAt,
            }, ["updatedAt", "__v"]);
        });

        res.status(200).send({ comments: commentsWithTimezone });
        return;
    } catch (error: any) {
        logger.error(error);
        res.status(500).send({message: "Internal Server Error"});
    }
};
