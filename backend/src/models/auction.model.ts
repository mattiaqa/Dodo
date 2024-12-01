import mongoose from "mongoose";
import { UserDocument } from "./user.model";
import crypto from 'crypto';
import {BookDocument} from "./book.model";

export interface AuctionInput {
    book: BookDocument['_id'];
    price: number;
    condition: string;
    description: string;
    country: string;
    province: string;
    expireDate: Date;
    seller: UserDocument['_id'];
  }
  
export interface AuctionDocument extends AuctionInput, mongoose.Document {
    auctionId: string;
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
        book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        price: { type: Number, required: true },
        condition: { type: String, required: true },
        description: { type: String, required: false },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        country: { type: String, required: true },
        province: { type: String, required: true },
        images: [{ type: String, required: false }],
        expireDate: {type: Date, required: true},
        winner: { type: String, required: false}
    },
    {
        timestamps: true,
    }
);

const AuctionModel = mongoose.model<AuctionDocument>("Auction", auctionSchema);

export default AuctionModel;