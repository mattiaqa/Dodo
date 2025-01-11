import mongoose from "mongoose";
import { object, string, TypeOf, number, preprocess, date, array } from "zod";

// Crea un tipo di validazione per ObjectId
const objectId = (value: any) => {
    if (mongoose.Types.ObjectId.isValid(value)) {
        return value;
    }
    throw new Error('Invalid ObjectId');
};

export const createAuctionSchema = object({
    title: string({
        required_error: "Title is required!",
    }),
    lastBid: number({
        required_error: "lastBid is required!",
    }),
    description: string(/*{
        required_error: "Description is required!",
    }*/).optional(),
    condition: string({
        required_error: "Condition is required!",
    }),
    country: string({
        required_error: "Country is required!",
    }),
    province: string({
        required_error: "Province is required!",
    }),
    expireDate: preprocess((arg) => {
        if (typeof arg === "string" || arg instanceof Date) {
            return new Date(arg);
        }
    }, date({
        required_error: "Expire date is required!",
    })),
    book: preprocess(objectId, string().optional()), // Sanifica l'ObjectId
    //book: object(bookBaseFields).optional(),
    /*book: string()
        .regex(/^\d{13}$/, { message: "Book must be a valid ISBN (13 numeric digits)" })
        .optional(),*/
});

export const editAuctionSchema = createAuctionSchema.pick({
    title: true,
    description: true,
    book: true,
}).partial();

export const searchAuctionSchema = object({
    bookId: string().optional(), // Deve essere una stringa, opzionale
    minPrice: string().regex(/^\d+(\.\d+)?$/, {message : "minPrice must be a valid number"}).optional(), // Deve essere un numero positivo
    maxPrice: string().regex(/^\d+(\.\d+)?$/, {message : "maxPrice must be a valid number"}).optional(), // Deve essere un numero positivo
    sellerId: string().optional(), // Deve essere una stringa, opzionale
    where: string().regex(/^\d{13}$/, { message : "Book must be a valid ISBN (13 numeric digits)" }).optional(), // Deve essere una stringa, opzionale
    ISBN: string().optional(), // Deve essere una stringa, opzionale
});

export const getAuctionSchema = object({
    auctionId: string({ required_error: "Auction ID is required!" })
});

export type GetAuctionInput = TypeOf<typeof getAuctionSchema>;
export type SearchAuctionInput = TypeOf<typeof getAuctionSchema>;
export type DeleteAuctionInput = TypeOf<typeof getAuctionSchema>;
