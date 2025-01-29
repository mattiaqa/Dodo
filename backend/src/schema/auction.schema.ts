import mongoose from "mongoose";
import { object, string, TypeOf, number, preprocess, date, array } from "zod";

// Crea un tipo di validazione per ObjectId
const objectId = (value: any) => {
    if (mongoose.Types.ObjectId.isValid(value)) {
        return value;
    }
    throw new Error('Invalid ObjectId');
};

const baseAuctionSchema = object({
    title: string({
        required_error: "Title is required!",
    }),
    lastBid: preprocess((val) => {
        // Se il valore è una stringa, lo trasformiamo in numero
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? undefined : parsed;
        }
        return val;
    }, number({
        required_error: "lastBid is required!",
    })),
    reservePrice:  preprocess((val) => {
        if (val === undefined) return val; // Se non c'è un valore, lasciamo undefined
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? undefined : parsed;
        }
        return val;
    }, number().optional()),
    description: string().optional(),
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
    //book: preprocess(objectId, string().optional()), // Sanifica l'ObjectId
    book: string().optional(),
})

export const createAuctionSchema = baseAuctionSchema.superRefine((obj, ctx) => {
    if (obj.reservePrice !== undefined && obj.reservePrice < obj.lastBid) {
        ctx.addIssue({
            code: "custom",
            path: ["reservePrice"], // Campo al quale si riferisce l'errore
            message: "Reserve price, if present, must be greater than or equal to lastBid!",
        });
    }
});

export const editAuctionSchema = baseAuctionSchema.pick({
    title: true,
    description: true,
    book: true,
}).partial().extend({
    imagesToRemove: preprocess(
        (val) => {
            // Se è una stringa, prova a farne il parse in un array
            if (typeof val === "string") {
                try {
                    return JSON.parse(val);
                } catch {
                    return []; // Torna un array vuoto se il parse fallisce
                }
            }
            return val; // Ritorna il valore originale (già array)
        }, array(string())
        .max(10, "You can remove a maximum of 10 images.")
        .optional(),
    )
});

export const searchAuctionSchema = object({
    auctionTitle: string().optional(),
    where: string().optional(), // Deve essere una stringa, opzionale
    minPrice: string().regex(/^\d+(\.\d+)?$/, {message : "minPrice must be a valid number"}).optional(), // Deve essere un numero positivo
    maxPrice: string().regex(/^\d+(\.\d+)?$/, {message : "maxPrice must be a valid number"}).optional(), // Deve essere un numero positivo
    sellerId: string().optional(), // Deve essere una stringa, opzionale

    bookId: string().optional(), // Deve essere una stringa, opzionale
    ISBN: string().regex(/^\d{13}$/, { message : "Book must be a valid ISBN (13 numeric digits)" }).optional(), // Deve essere una stringa, opzionale
    bookTitle: string().optional(),
    bookPublisher: string().optional(),
    bookAuthor: string().optional()
});

export const getAuctionSchema = object({
    auctionId: string({ required_error: "Auction ID is required!" })
});

export type GetAuctionInput = TypeOf<typeof getAuctionSchema>;
export type SearchAuctionInput = TypeOf<typeof getAuctionSchema>;
export type DeleteAuctionInput = TypeOf<typeof getAuctionSchema>;
