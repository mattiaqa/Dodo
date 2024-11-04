import mongoose from "mongoose";
import { UserDocument } from "./user.model";
import { AuctionDocument } from "./auction.model";

export interface BidInput {
    price: number;
    auctionId: AuctionDocument['auctionId'];
    buyer: UserDocument['_id'];
}
  
export interface BidDocument extends BidInput, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
}

const bidSchema = new mongoose.Schema(
    {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        auctionId: { type: String, ref: "Auction" },
        price: {type: Number, required: true}
    },
    {
        timestamps: true,
    }
);

const BidModel = mongoose.model<BidDocument>("Bid", bidSchema);

export default BidModel;