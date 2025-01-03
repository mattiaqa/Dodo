import { Request, Response } from "express";
import logger from "../utils/logger";
import { searchAuctionById } from "../service/auction.service";
import { findUser } from "../service/user.service";
import { addComment, getComments } from "../service/comment.service";
import {omit} from "lodash";

export const addCommentHandler = async (req: Request, res: Response) => {
    const { auctionId } = req.params;
    const { comment } = req.body;

    try {
        const auctionExists = await searchAuctionById({auctionId: auctionId});
        if (!auctionExists) {
            res.status(404).send({ message: "Auction not found" });
            return;
        }
        
        const user = await findUser({_id: res.locals.user._id});
        if(!user)
        {
            res.status(404).send({ message: "User not found" });
            return;
        }

        addComment({
            auctionId: auctionId,
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
        const comments = await getComments({ auctionId: auctionId });

        if (comments.length == 0) {
            res.status(404).send({ message: "No comments found for this auction" });
            return;
        }

        const sanitizedComments = comments.map(comment => omit(comment, '__v', '_id', 'auctionId', 'updatedAt'));

        res.status(200).send(sanitizedComments);
        return;
    } catch (error: any) {
        logger.error(error);
        res.status(500).send({message: "Internal Server Error"});
    }
};
