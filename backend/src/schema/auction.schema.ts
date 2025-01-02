import { object, string, TypeOf, number, preprocess, date } from "zod";
import {bookBaseFields} from "./book.schema";

const auctionBaseFields = {
    title: string({
        required_error: "Name is required!",
    }),
    book: object(bookBaseFields),
    lastBid: number({
        required_error: "lastBid is required!",
    }),
    description: string({
        required_error: "Description is required!",
    }),
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
};

const searchQuerySchema = object({
    body: object({
        where: string({
            required_error: "Where is required!",
        }),
        ISBN: string({
            required_error: "ISBN is required!",
        }),
        budget: number({
            required_error: "Budget is required!",
        })
    }),
});

const auctionSchema = object({
    body: object({
        ...auctionBaseFields,
    }),
});

export const createAuctionSchema = auctionSchema;
export const updateAuctionSchema = auctionSchema;
export const getAuctionSchema = searchQuerySchema;
export const searchAuctionSchema = searchQuerySchema;

export type CreateAuctionInput = TypeOf<typeof createAuctionSchema>;
export type UpdateAuctionInput = TypeOf<typeof updateAuctionSchema>;
export type GetAuctionInput = TypeOf<typeof getAuctionSchema>;
export type SearchAuctionInput = TypeOf<typeof getAuctionSchema>;
export type DeleteAuctionInput = TypeOf<typeof getAuctionSchema>;
