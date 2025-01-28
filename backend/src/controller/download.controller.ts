import {Request, Response} from "express";
import path from "path";

export const imageDownload = async (req: Request, res: Response) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../../public/uploads/', filename);
    const normalizedPath = path.normalize(imagePath);

    res.sendFile(normalizedPath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
}

export const downloadAvatar = async (req: Request, res: Response) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../../public/uploads/avatars/', filename);
    const normalizedPath = path.normalize(imagePath);

    res.sendFile(normalizedPath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
}