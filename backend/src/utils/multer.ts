import { writeFile } from 'fs/promises';
import sanitize from 'mongo-sanitize';
import multer from 'multer';
import path from 'path';

const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];

// Funzione di filtro per convalidare i file
function fileFilter(req: Express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
    const safeFilename = sanitize(file.originalname);
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
    for (const file of files) {
        const filename = sanitize(file.filename);
        const filePath = path.join(uploadPath, `${Date.now()}_${crypto.randomUUID()}_${filename}`);
        await writeFile(filePath, file.buffer); // Salva il buffer nel file system
        uploadedFilePaths.push(filePath); // Aggiungi il percorso all'elenco
    }
    return uploadedFilePaths;
};

// Multer per le immagini del profilo
export const uploadProfilePicture = multer({
    storage: multer.memoryStorage(), // Salva in "profile" folder
    fileFilter,
    limits: { fileSize: 1 * 1024 * 1024 }, // Limite di 1 MB per le immagini del profilo
}).single('avatar'); // 'avatar' è il nome del campo per l'immagine del profilo

// Multer per le immagini delle aste
export const uploadAuctionImages = multer({
    storage: multer.memoryStorage(), // Salva in "auctions" folder
    fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 }, // Limite di 3 MB per le immagini delle aste},
  }).array('images', 10); // 'auctionImages' è il nome del campo per le immagini delle aste, con un massimo di 10 immagini

/*
const storage = (folder: string) =>  multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, `../../public/uploads/${folder}`));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const newName = Date.now() + '_' + crypto.randomUUID() + ext;
        cb(null, newName);
    }
});
*/