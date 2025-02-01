import {Request, Response} from "express";
import path from "path";

/**
 * Handler to download an image associated with an auction.
 *
 * Process:
 * - Retrieves the filename from the request parameters.
 * - Constructs the file path for the image located in the `uploads/auctions` folder.
 * - Sends the file to the client.
 * - If the file is not found, returns a 404 error with a 'File not found' message.
 */
export const imageDownload = async (req: Request, res: Response) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../../public/uploads/auctions/', filename);
    const normalizedPath = path.normalize(imagePath);

    res.sendFile(normalizedPath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
}

/**
 * Handler to download a user's avatar.
 *
 * Process:
 * - Retrieves the filename of the avatar from the request parameters.
 * - Constructs the file path for the avatar located in the `uploads/avatars` folder.
 * - Sends the file to the client.
 * - If the file is not found, returns a 404 error with a 'File not found' message.
 */
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
