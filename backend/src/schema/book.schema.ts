import {array, object, string, TypeOf} from "zod";
import {searchAuctionSchema} from "./auction.schema";

export const bookBaseFields = {
    title: string({
        required_error: "Name is required!",
    }),
    ISBN: string({
        required_error: "ISBN is required!",
    }),
    author: array(string(), {
        required_error: "Author is required!",
    }),
    publisher: string({
        required_error: "ISBN is required!",
    }),
    publishedDate: string({
        required_error: "ISBN is required!",
    }),
    language: string({
        required_error: "ISBN is required!",
    }),
};

const bookInfoSchema = object({
    body: object({
        ISBN: string({
            required_error: "ISBN is required!",
        }),
    }),
});

const bookSchema = object({
    body: object({
        ...bookBaseFields,
    }),
});

export const getBookInfoParams = bookInfoSchema;
export const createBookSchema = bookSchema;
export type SearchAuctionInput = TypeOf<typeof searchAuctionSchema>;
export type GetBookInfoInput = TypeOf<typeof getBookInfoParams>;
