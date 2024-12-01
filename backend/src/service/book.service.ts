import { FilterQuery, QueryOptions } from "mongoose";
import BookModel , { BookDocument, BookInput } from "../models/book.model";
import logger from "../utils/logger";
import sanitize from "mongo-sanitize";

export async function createBook(newBook: BookInput): Promise<BookDocument | undefined> {
    try {
        const newBookSanitized = sanitize(newBook);
        return await BookModel.create(newBookSanitized);
    } catch (e: any) {
        logger.error(e);
    }
}

export async function searchBookByISBN(ISBN: string, options: QueryOptions = {lean: true}) {
    try {
        const sanitizedISBN = sanitize(ISBN);
        return await BookModel.findOne({ ISBN: sanitizedISBN}, {}, options);
    } catch (e:any) {
        logger.error(e);
    }
}