import mongoose from "mongoose";
import { UserDocument } from "./user.model";
import crypto from 'crypto';
import {BookDocument} from "./book.model";

export interface AuctionInput {
    book?: BookDocument['_id'];
    lastBid: number;
    reservePrice?: number;
    condition: string;
    description?: string;
    country: string;
    province: string;
    expireDate: Date;
    seller: UserDocument['_id'];
    title: string;
    images?: string[];
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
        book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: false },
        lastBid: { type: Number, required: true, default: 0.00 },
        reservePrice: { type: Number, required: true, default: 0.00 },
        condition: { type: String, required: true },
        description: { type: String, required: false },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        country: { type: String, required: true },
        province: { type: String, required: true },
        expireDate: {type: Date, required: true},
        winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false},
        likes: { type: Number, required: false, default: 0 },
        interactions: { type: Number, required: false, default: 0 },
        views: { type: Number, required: false, default: 0 },
        images: {
            type: [String], // Array di stringhe
            validate: {
                validator: function (value: string[]) {
                    return value.length <= 10; // Massimo 10 immagini
                },
                message: "You can upload a maximum of 10 images."
            },
            required: false
        },
    },
    {
        timestamps: true,
    }
);

const AuctionModel = mongoose.model<AuctionDocument>("Auction", auctionSchema);

export default AuctionModel;