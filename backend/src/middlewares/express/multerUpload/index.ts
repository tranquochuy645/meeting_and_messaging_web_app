import multer from 'multer';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dynamicPath = `media/${req.params.userId}/${req.params.roomId}`;
    // Create the directory if it doesn't exist
    fs.mkdirSync(dynamicPath, { recursive: true });
    cb(null, dynamicPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + file.originalname);
  },
});
const multerUpload = multer({ storage: storage }).single('file');
const multerUploadMany = multer({ storage: storage }).array('files', 5);

export { multerUpload, multerUploadMany };
