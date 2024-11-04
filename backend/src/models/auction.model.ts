import mongoose from "mongoose";
import { UserDocument } from "./user.model";
import crypto from 'crypto';

export interface AuctionInput {
    title: string;
    price: number;
    condition: string;
    description: string;
    seller: UserDocument['_id'];
    country: string;
    province: string;
    expireDate: Date;
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
        title: { type: String, required: true },
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