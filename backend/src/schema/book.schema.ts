import {array, object, string, TypeOf, z} from "zod";
import {searchAuctionSchema} from "./auction.schema";
import mongoose from "mongoose";

const bookSchema = object({
    title: string({
        required_error: "Name is required!",
    }),
    subtitle: string().optional(),
    authors: array(string(), {
        required_error: "Author is required!",
    }),
    publisher: string({
        required_error: "Publisher is required!",
    }),
    publishedDate: string({
        required_error: "Published date is required!",
    }),
    description: string({
        required_error: "Description is required!",
    }),
    ISBN: string({
        required_error: "ISBN is required!",
    }),
    language: string({
        required_error: "Language is required!",
    }),
    imageLinks: object({
        smallThumbnail: string().url().optional(), // URL valida per la miniatura piccola
        thumbnail: string().url().optional(),     // URL valida per la miniatura grande
    }).optional(), // imageLinks è facoltativo
});


// Schema per AddBook
// Creazione dello schema Zod per SearchBookResult
export const addBookSchema = object({
    mongoId: z.custom((value) => 
        mongoose.Types.ObjectId.isValid(value), 
        {
            message: "Invalid ObjectId",
        }
    ).optional(), // `mongoId` deve essere un ObjectId valido o assente
    title: string(),
    ISBN: string(), // ISBN è opzionale
    authors: array(string()), // authors è un array opzionale di stringhe
    publishedDate: string(),

    subtitle: string().optional(),
    publisher: z.string().optional(),
    language: z.string().optional(),
    description: z.string().optional(),
    imageLinks: z.object({
      smallThumbnail: z.string().url().optional(),
      thumbnail: z.string().url().optional(),
    }).optional(), // imageLinks è opzionale, con URL per le immagini
});


export const searchBookSchema = object({
    title: string().optional(),
    ISBN: string().regex(/^\d{13}$/, { message: "Book must be a valid ISBN (13 numeric digits)" }).optional(),
    publisher: string().optional(),
    author: string().optional(),
});

export const createBookSchema = bookSchema;
export type SearchAuctionInput = TypeOf<typeof searchAuctionSchema>;

// Inferisci il tipo TypeScript
export type BookSchema = z.infer<typeof bookSchema>;
export type AddBookSchema = z.infer<typeof addBookSchema>;