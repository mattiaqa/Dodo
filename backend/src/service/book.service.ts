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
    const { title, ISBN, author, publisher } = sanitizedQuery;

    const match: Record<string, any> = {};
    if (ISBN) {
        match.ISBN = ISBN; // Filtro per ISBN se specificato
    }
    if (title) {
        match.title = { $regex: title, $options: "i" }; // Filtro per titolo se specificato (case-insensitive)
    }
    if (author)
    {
        match.authors = { $regex: author, $options: "i" };
    }
    if (publisher)
    {
        match.publisher = { $regex: publisher, $options: "i" };
    }

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

    const books = await BookModel.aggregate([
        {
            $match: match // Applica il filtro dinamico
        },
        {
            $project: project // Applica il proiezione
        }
    ]);
    return books ?? []
    // Se nessun criterio è specificato, ritorna un array vuoto
    //return [];
}

export async function searchBookOnline(query: z.infer<typeof searchBookSchema>) : Promise<SearchBookResult[]> {
    const GOOGLE_BOOKS_API_BASE_URL = "https://www.googleapis.com/books/v1/volumes";
    const sanitizedQuery = sanitize(query)
    const { title, ISBN, author, publisher } = sanitizedQuery;
    try{
        // Costruisci la query dinamica
        const queryParts: string[] = [];

        if (ISBN) {
            queryParts.push(`isbn:${ISBN}`);
        }
        if (title) {
            queryParts.push(`intitle:${encodeURIComponent(title)}`);
        }
        if (author) {
            queryParts.push(`inauthor:${encodeURIComponent(author)}`);
        }
        if (publisher) {
            queryParts.push(`inpublisher:${encodeURIComponent(publisher)}`);
        }

        // Combina i parametri in un'unica query
        const queryString = queryParts.join("+");
        const response = await axios.get(`${GOOGLE_BOOKS_API_BASE_URL}?q=${queryString}`);

        if (response?.data?.items?.length > 0) {
            const books: SearchBookResult[] = response!.data.items.map((item: any) => {
                const isbn = item.volumeInfo.industryIdentifiers?.find(
                    (id: any) => id.type === "ISBN_13"
                )?.identifier;

                // Escludi gli elementi senza ISBN
                if (!isbn) return null;
        
                return {  
                    //id: item.id,
                    title: item.volumeInfo.title || "No title available",
                    ISBN: isbn,
                    authors: item.volumeInfo.authors || [],
                    publisher: item.volumeInfo.publisher || "Unknown publisher",
                    publishedDate: item.volumeInfo.publishedDate || "Unknown date",
                    language: item.volumeInfo.language || "Unknown language",
                    description: item.volumeInfo.description || "No description available",
                    imageLinks: item.volumeInfo.imageLinks || "No images",
                }
            });

            return books.filter((book) => book !== null) as SearchBookResult[];;
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