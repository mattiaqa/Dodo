import multer from 'multer';
import path from 'path';

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
    fileFilter: function (req, filePath, callback) {
        const ext = path.extname(filePath.originalname);
        /*if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.txt') {
            return callback(new Error('Only images are allowed!'));
        }*/

        /*const acceptedTypes = filePath.mimetype.split('/');
        if (acceptedTypes[0] !== 'image') {
            return callback(new Error('Only images are allowed!'));
        }*/
        
        callback(null, true)},
    limits:{
        fileSize: 1024 * 1024
    }
});

export default upload;