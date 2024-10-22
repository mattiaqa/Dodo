import mongoose from "mongoose";
import {UserDocument} from "./user.model";
import crypto from 'crypto';

export interface AuctionInput {
    title: string;
    price: number;
    condition: string;
    description: string;
    seller: UserDocument['_id'];
  }
  
export interface AuctionDocument extends AuctionInput, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
}

const auctionSchema = new mongoose.Schema(
    {
        auctionId: {
            type: String,
            required: true,
            unique: true,
            default: () => `${crypto.randomUUID()}`
        },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        condition: { type: String, required: true },
        description: { type: String, required: false },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

const AuctionModel = mongoose.model<AuctionDocument>("Auction", auctionSchema);

export default AuctionModel;