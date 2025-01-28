import { mkdir, writeFile } from 'fs/promises';
import sanitizeFilename from 'sanitize-filename'
import multer from 'multer';
import path from 'path';

const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];

// Funzione di filtro per convalidare i file
function fileFilter(req: Express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
    const safeFilename = sanitizeFilename(file.originalname);
    const ext = path.extname(safeFilename);

    if (!allowedFileTypes.includes(file.mimetype) || !['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
        callback(new Error('Only images are allowed!'));
        return;
    }

    callback(null, true);
}

export const saveFilesToDisk = async (files: Express.Multer.File[], folder: string) => {
    const uploadedFilePaths: string[] = [];
    const uploadPath = path.join(__dirname, `../../public/uploads/${folder}/`);

    // Assicurati che la cartella esista, altrimenti creala
    await mkdir(uploadPath, { recursive: true });

    for (const file of files) {
        let filename = sanitizeFilename(file.originalname);
        filename = `${Date.now()}_${crypto.randomUUID()}_${filename}`;
        const filePath = path.join(uploadPath, filename);
        await writeFile(filePath, file.buffer); // Salva il buffer nel file system
        
        uploadedFilePaths.push(filename); // Aggiungi il percorso all'elenco
    }
    return uploadedFilePaths;
};

export const uploadProfilePicture = multer({
    storage: multer.memoryStorage(), 
    fileFilter,
    limits: { fileSize: 1 * 1024 * 1024 },
}).single('avatar');


export const uploadAuctionImages = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 },
}).array('images', 10);
