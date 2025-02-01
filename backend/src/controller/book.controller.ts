import {Request, Response} from "express";
import {createBookSchema, BookSchema, searchBookSchema} from "../schema/book.schema";
import logger from "../utils/logger";
import BookModel from "../models/book.model";
import { createOrGetBook, SearchBookResult } from "../service/book.service";
import { z } from "zod";
import { signJwt } from "../utils/jwt.utils";

/**
 * Handler to add a book to the database.
 *
 * Process:
 * - Attempts to create a new book or retrieve an existing one based on provided data.
 * - Returns a success response with the book's ID if successfully added or found.
 * - Handles errors and returns an internal server error response in case of failure.
 */
export async function addBookHandler(req: Request<{},{}, z.infer<typeof createBookSchema>>, res: Response) {
    try
    {
        const resultId = await createOrGetBook(req.body);
        res.status(200).send({
            "Message": "Book fetched successfully from the database",
            "_id": resultId?._id
        });
        return;

    } catch (e) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}

/**
 * Handler to delete a book from the database using its ISBN.
 *
 * Process:
 * - Tries to find and delete the book with the given ISBN from the database.
 * - Returns a success response with the deleted book data if successful.
 * - Returns a 404 error if the book is not found.
 * - Handles internal server errors and returns an appropriate error message if any occur.
 */
export async function deleteBookHandler(req: Request, res: Response)
{
    try {
        const { isbn } = req.params;

        // Tries to find and delete the book by ISBN
        const deletedBook = await BookModel.findOneAndDelete({ ISBN: isbn });

        if (!deletedBook) {
            res.status(404).json({ message: 'Book not found' });
            return;
        }

        res.status(200).json({ message: 'Book deleted successfully', deletedBook });
        return;
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
}

/**
 * Handler to search for books based on title or ISBN.
 *
 * Process:
 * - Accepts search parameters from the query (title or ISBN).
 * - If neither parameter is provided, returns an empty results array.
 * - Searches for books using the specified search function (either local or online search).
 * - Returns the list of found books in the response.
 * - Handles errors and returns an internal server error message if any occur.
 */
export async function searchBookHandler(
    req: Request<{},{},{}, z.infer<typeof searchBookSchema>>,
    res: Response,
    searchFunction: (query: z.infer<typeof searchBookSchema>) => Promise<SearchBookResult[]>)
{
    try{
        const { title, ISBN } = req.query;

        if (!title && !ISBN) {
            res.status(200).send({
                message: "Books found",
                results: []
            });
            return;
        }

        const books = await searchFunction(req.query);

        res.status(200).send({
            message: "Books found",
            results: books
        });
        return;
    } catch (error) {
        console.error('Error searching book:', error);
        res.status(500).json({ "Error": 'Internal server error' });
        return;
    }
}

/**
 * Handler to serialize book data and generate a JWT token for the book.
 *
 * Process:
 * - Generates a JWT token using the book data.
 * - Sets a cookie with the book's title and JWT token.
 * - Sends a response with the book's title and the token.
 * - Handles any errors and returns an internal server error message if any occur.
 */
export async function serializeBookHandler(req: Request<{}, {}, z.infer<typeof createBookSchema>>, res: Response)
{
    try {
        const book = req.body
        const token = signJwt(
            book,
            {expiresIn: '1h'}
        )
        res.cookie("selectedBook", JSON.stringify({title: book.title, token}));
        res.send(JSON.stringify({title: book.title, token}));
    } catch (error) {
        console.error('Error serializing book:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
}
