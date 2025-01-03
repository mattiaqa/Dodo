import {Request, Response} from "express";
import {GetBookInfoInput} from "../schema/book.schema";
import config from "config";
import axios from "axios";
import logger from "../utils/logger";

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