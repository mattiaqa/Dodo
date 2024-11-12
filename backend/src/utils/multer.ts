import multer from 'multer';
import path from 'path';

const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../../public/uploads/'));
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const newName = Date.now() + '_' + crypto.randomUUID() + ext;
      cb(null, newName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: async function (req, file, callback) {
        const ext = path.extname(file.originalname);
        
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.txt') {
            return callback(new Error('Only images are allowed!'));
        }

        if (!allowedFileTypes.includes(file.mimetype)) {
            return callback(new Error('Only images are allowed!'));
        }
        
        callback(null, true);
    },
    limits:{
        fileSize: 1024 * 1024
    }
});

export default upload;