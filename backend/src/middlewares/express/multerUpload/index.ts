import multer from "multer";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // You can determine the destination directory based on an argument or any other logic here
        const dynamicPath = `media/${req.params.userId}/${req.params.roomId}`; // Replace this with your logic
        cb(null, dynamicPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + file.originalname);
    },
});

const multerUpload = multer({ storage: storage }).single('file'); // Specify the field name for the uploaded file
export { multerUpload }