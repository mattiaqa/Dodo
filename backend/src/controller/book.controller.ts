import {Request, Response} from "express";
import {createBookSchema, BookSchema, searchBookSchema} from "../schema/book.schema";
import config from "config";
import axios from "axios";
import logger from "../utils/logger";
import BookModel from "../models/book.model";
import { createBook, createOrGetBook, searchBook, searchBookOnline, SearchBookResult } from "../service/book.service";
import { z } from "zod";

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
            res.status(400).send({
                message: "You must provide either a title or an ISBN to search."
            });
            return;
        }

        const books = await searchFunction(req.query);

        if (books.length === 0) {
            res.status(404).send({
                message: "No books found matching the search criteria."
            });
            return;
        }

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


/*
export async function getBookInfoHandler (req: Request<GetBookInfoInput['body']>, res: Response){
    try {
        const ISBN = req.body.ISBN.replace(/-/g, '');
        const apiKey = config.get('googleBooksApiKey');

        if(ISBN.length === 0) {
            res.sendStatus(400);
            return;
        }

        axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${ISBN}&key=${apiKey}`)
            .then((response) => {
                if(response.data.totalItems === 0) {
                    res.sendStatus(404);
                    return;
                }

                const filteredData = response.data.items.map((item: any) => ({
                    title: item.volumeInfo.title || 'Unknown',
                    authors: item.volumeInfo.authors || [],
                    publisher: item.volumeInfo.publisher || 'Unknown',
                    publishedDate: item.volumeInfo.publishedDate || 'Unknown',
                    language: item.volumeInfo.language || 'Unknown',
                    description: item.volumeInfo.description || 'Unknown',
                }));
                res.send(filteredData);
            })
            .catch(error => {
                console.log(error);
                res.sendStatus(500);
            });
    } catch (e) {
        logger.error(e);
        res.status(500).send({message: "Internal Server Error"});
    }
}
*/