import mongoose from "mongoose";
import { AuctionDocument } from "./auction.model";
import {UserDocument} from "./user.model";

export interface CommentInput {
    auction: AuctionDocument['auctionId'];
    username: string;
    userId: UserDocument['_id'];
    comment: string;
}

export interface CommentDocument extends CommentInput, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new mongoose.Schema(
    {
        auction: { type: String, ref: "Auction", required: true },
        username: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        comment: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const CommentModel = mongoose.model<CommentDocument>("Comment", commentSchema);

export default CommentModel;
