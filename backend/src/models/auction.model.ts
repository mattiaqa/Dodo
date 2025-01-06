import mongoose from "mongoose";
import { UserDocument } from "./user.model";
import crypto from 'crypto';
import {BookDocument} from "./book.model";

export interface AuctionInput {
    book: BookDocument['_id'];
    lastBid: number;
    condition: string;
    description: string;
    country: string;
    province: string;
    expireDate: Date;
    seller: UserDocument['_id'];
    title: string;
  }
  
export interface AuctionDocument extends AuctionInput, mongoose.Document {
    auctionId: string;
    createdAt: Date;
    updatedAt: Date;
    winner: UserDocument['_id'];
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
        book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        lastBid: { type: Number, required: true, default: 0.00 },
        condition: { type: String, required: true },
        description: { type: String, required: false },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        country: { type: String, required: true },
        province: { type: String, required: true },
        images: [{ type: String, required: false }],
        expireDate: {type: Date, required: true},
        winner: { type: String, required: false},
        likes: { type: Number, required: false, default: 0 },
        interactions: { type: Number, required: false, default: 0 },
        views: { type: Number, required: false, default: 0 },
    },
    {
        timestamps: true,
    }
);

const AuctionModel = mongoose.model<AuctionDocument>("Auction", auctionSchema);

export default AuctionModel;