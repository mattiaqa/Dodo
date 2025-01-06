import mongoose, { QueryOptions } from "mongoose";
import BookModel , { BookDocument, BookInput } from "../models/book.model";
import sanitize from "mongo-sanitize";

export async function createBook(newBook: BookInput): Promise<BookDocument | undefined> {
    try {
        const newBookSanitized = sanitize(newBook);
        return await BookModel.create(newBookSanitized);
    } catch (e: any) {
        throw new Error(e.message);
    }
}

export async function searchBookByISBN(ISBN: string, options: QueryOptions = {lean: true}) {
    try {
        const sanitizedISBN = sanitize(ISBN);
        return await BookModel.findOne({ ISBN: sanitizedISBN}, {}, options);
    } catch (e:any) {
        throw new Error(e.message);
    }
}

export async function getBookById(bookId: mongoose.Schema.Types.ObjectId) {
    try {
        const sanitizedId = sanitize(bookId);
        return await BookModel.findOne({ _id: sanitizedId});
    } catch (e:any) {
        throw new Error(e.message);
    }
}