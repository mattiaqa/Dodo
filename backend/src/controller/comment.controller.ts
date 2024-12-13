import { Request, Response } from "express";
import CommentModel from "../models/comment.model";
import { searchAuctionById } from "../service/auction.service";
import { findUser } from "../service/user.service";
import { addComment, getComments } from "../service/comment.service";

export const addCommentHandler = async (req: Request, res: Response) => {
    const { auctionId } = req.params;
    const { comment } = req.body;

    try {
        // Controlla che l'asta esista
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
        

        // Crea il commento
        addComment({
            auction: auctionExists._id,
            username: user.name,
            profileImage: user.avatar!,
            comment,
        });

        res.status(201).send({ message: "Comment added successfully" });
        return;
    } catch (error: any) {
        res.status(500).send({ message: "Internal server error", error: error.message });
        return;
    }
};


export const getCommentsHandler = async (req: Request, res: Response) => {
    const { auctionId } = req.params;

    try {
        const comments = await getComments({ auctionId: auctionId });

        if (!comments.length) {
            res.status(404).send({ message: "No comments found for this auction" });
            return;
        }

        res.status(200).send({ comments });
        return;
    } catch (error: any) {
        res.status(500).send({ message: "Internal server error", error: error.message });
        return
    }
};
