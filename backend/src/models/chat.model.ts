import mongoose from "mongoose";
import { UserDocument } from "./user.model";
import { AuctionDocument } from "./auction.model";

export interface ChatInput {
    participants: UserDocument["_id"][];
    auctionId: AuctionDocument['auctionId'];
}

export interface ChatDocument extends ChatInput, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
}

const chatSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        auctionId: { type: String, ref: "Auction" },
    },
    {
        timestamps: true,
    }
);

const ChatModel = mongoose.model<ChatDocument>("Chat", chatSchema);

export default ChatModel;