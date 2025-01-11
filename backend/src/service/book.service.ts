import mongoose, { QueryOptions } from "mongoose";
import BookModel , { BookDocument, BookInput } from "../models/book.model";
import sanitize from "mongo-sanitize";
import axios from "axios";
import { z } from "zod";
import { addBookSchema, createBookSchema, searchBookSchema } from "../schema/book.schema";
import { imageDownload } from "../controller/download.controller";
import { omit } from "lodash";

export async function createBook(newBook: BookInput): Promise<BookDocument | undefined> {
    try {
        const newBookSanitized = sanitize(newBook);
        return await BookModel.create(newBookSanitized);
    } catch (e: any) {
        throw new Error(e.message);
    }
}

export async function createOrGetBook(newBook: z.infer<typeof addBookSchema>): Promise<BookDocument | null> {
    try {
        const newBookSanitized = sanitize(newBook);
        if(newBookSanitized.mongoId)
        {
            const candidateBook = await BookModel.findById(newBookSanitized.mongoId);
            if(candidateBook) return candidateBook;
        }
        const candidateBook = await BookModel.findOne({ ISBN: newBookSanitized.ISBN });
        if(candidateBook)  return candidateBook;

        return await BookModel.create(omit(newBookSanitized, 'mongoId'));
    } catch (e: any) {
        throw new Error(e.message);
    }
}

export type SearchBookResult = Pick<BookDocument, "title"|"subtitle"|"ISBN"|"authors"|"publisher"|"publishedDate"|"language"|"description"|"imageLinks"> & { mongoId : BookDocument['_id'] | undefined};
export async function searchBook(query: z.infer<typeof searchBookSchema>) : Promise<SearchBookResult[]>{
    
    const sanitizedQuery = sanitize(query)
    const { title, ISBN } = sanitizedQuery;

    const project = {
        mongoId: "$_id", // Rinomina _id in mongoId
        title: 1,   // Mantieni il campo title
        ISBN: 1,    // Mantieni il campo ISBN
        authors: 1,
        publisher: 1,
        publishedDate: 1,
        language: 1,
        description: 1,
        imageLinks: 1,
        _id: 0      // Escludi il campo originale _id
    }

    // Se è specificato un ISBN, cerca corrispondenza esatta
    if (ISBN) {
        const book = (await BookModel.aggregate([
            {
              $match: { ISBN }
            },
            {
                $project: project
            },
        ]))[0];  // Prendi il primo (e unico) elemento
        if (book) {
            return [book]; // Ritorna un array con un singolo risultato
        }
    }

    // Se non c'è ISBN, cerca per titolo (match parziale)
    if (title) {
        const books = await BookModel.aggregate([
            {
                $match: {
                    title: { $regex: title, $options: "i" } // Ricerca case-insensitive sul titolo
                }
            },
            {
                $project: project
            }
        ]);
        if(books)
            return books; // Ritorna tutti i risultati che corrispondono
    }

    // Se nessun criterio è specificato, ritorna un array vuoto
    return [];
}

export async function searchBookOnline(query: z.infer<typeof searchBookSchema>) : Promise<SearchBookResult[]> {
    const GOOGLE_BOOKS_API_BASE_URL = "https://www.googleapis.com/books/v1/volumes";
    const sanitizedQuery = sanitize(query)
    const { title, ISBN } = sanitizedQuery;
    try{
        let response;
    
        // Cerca per ISBN
        if (ISBN) {
          response = await axios.get(`${GOOGLE_BOOKS_API_BASE_URL}?q=isbn:${ISBN}`);
        }
        // Cerca per titolo
        else if (title) {
          response = await axios.get(`${GOOGLE_BOOKS_API_BASE_URL}?q=intitle:${title}`);
        }

        if (response?.data?.items?.length > 0) {
            const books: SearchBookResult[] = response!.data.items.map((item: any) => ({
              id: item.id,
              title: item.volumeInfo.title || "No title available",
              ISBN: item.volumeInfo.industryIdentifiers?.find((id: any) => id.type === "ISBN_13")?.identifier || "No ISBN available",
              authors: item.volumeInfo.authors || [],
              publisher: item.volumeInfo.publisher || "Unknown publisher",
              publishedDate: item.volumeInfo.publishedDate || "Unknown date",
              language: item.volumeInfo.language || "Unknown language",
              description: item.volumeInfo.description || "No description available",
              imageLinks: item.volumeInfo.imageLinks || "No images",
            }));

            return books;
        }
      
        // Se non ci sono risultati
        return [];

    } catch (error) {
        console.error("Error fetching book data from Google Books API", error);
        throw new Error("Failed to fetch book data from Google Books API");
    }
}

export const searchBookByISBNFromGoogle = async (isbn: string) => {
    const GOOGLE_BOOKS_API_BASE_URL = "https://www.googleapis.com/books/v1/volumes";
    try {
        const response = await axios.get(`${GOOGLE_BOOKS_API_BASE_URL}?q=isbn:${isbn}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching book data from Google Books API", error);
        throw new Error("Failed to fetch book data from Google Books API");
    }
};

export async function getBookById(bookId: mongoose.Schema.Types.ObjectId) {
    try {
        const sanitizedId = sanitize(bookId);
        return await BookModel.findOne({ _id: sanitizedId});
    } catch (e:any) {
        throw new Error(e.message);
    }
}