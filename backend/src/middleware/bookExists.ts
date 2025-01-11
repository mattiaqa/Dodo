import { Request, Response, NextFunction } from "express";
//import { searchBookByISBN, searchBookByISBNFromGoogle } from "../service/book.service";
import { BookSchema } from "../schema/book.schema";

const bookExists = 
//(isbn: string) =>
async (req: Request, res: Response, next: NextFunction) => {
    /*const isbn = req.body.book;
    
    if(!isbn || isbn.length == 0)
    {
        next();
        return;
    }

    let book = await searchBookByISBN(isbn);
    if(book) 
    {
        next();
        return;
    }
    
    let response = await searchBookByISBNFromGoogle(isbn);
    
    // Controlla che ci siano items nella risposta
    if (!response.items)
    {
        res.status(404).send({
            "Message": "The requested book is not present in the database"
        });
    }

    // Mappa ogni item per estrarre e validare i dati richiesti
    const books: BookSchema[] = response.items.map((item: any) => {
        try {
            const volumeInfo = item.volumeInfo;

            // Estrai gli identificatori ISBN
            const isbn13 = volumeInfo.industryIdentifiers?.find(
                (id: any) => id.type === "ISBN_13"
            )?.identifier;

            // Costruisci l'oggetto conforme al tuo schema
            const book : BookSchema = {
                googleId: item.id,
                title: volumeInfo.title,
                subtitle: volumeInfo.subtitle,
                authors: volumeInfo.authors || [],
                publisher: volumeInfo.publisher || "Unknown Publisher",
                publishedDate: volumeInfo.publishedDate || "Unknown Date",
                language: volumeInfo.language || "Unknown Language",
                ISBN: isbn13 || "",
                description: volumeInfo.description || "No description available",
                imageLinks: volumeInfo.imageLinks,
            };

            // Valida l'oggetto con Zod
            return book;
        } catch (error) {
            console.error("Error parsing book:", error);
            return null; // Ignora l'elemento non valido
        }
    });

    // Rimuovi eventuali risultati nulli (elementi non validi)
    const results = books.filter((book) => book !== null);

    res.status(400).send({
        "Message": "The requested book is not present in the database. Choose one of the following online results",
        "results": results
    });
    return;*/
}

export default bookExists;