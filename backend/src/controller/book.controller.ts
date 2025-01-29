import {Request, Response} from "express";
import {createBookSchema, BookSchema, searchBookSchema} from "../schema/book.schema";
import config from "config";
import axios from "axios";
import logger from "../utils/logger";
import BookModel from "../models/book.model";
import { createBook, createOrGetBook, searchBook, searchBookOnline, SearchBookResult } from "../service/book.service";
import { z } from "zod";
import { signJwt } from "../utils/jwt.utils";

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

export async function deleteBookHandler(req: Request, res: Response)
{
    try {
        const { isbn } = req.params;
    
        // Trova ed elimina il libro dal database
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