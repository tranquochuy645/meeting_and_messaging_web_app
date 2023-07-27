import { MulterError } from 'multer';
import { filterMediaAccess } from '../../middlewares/express/filterMediaAccess';
import { filterMediaAdmin } from '../../middlewares/express/filterMediaAdmin';
import { multerUpload, multerUploadMany } from '../../middlewares/express/multerUpload';
import { Router } from 'express';
import { resolve } from 'path';
const router = Router();
// GET /media/:userId/:roomId/:filename?token=<token>
router.get('/:userId/:roomId/:filename',
    filterMediaAccess,
    (req, res) => {
        // Ensure that the filename is properly sanitized to prevent directory traversal attacks
        // Remove any ".." to prevent traversal
        const filename = req.params.filename.replace(/\.\.\//g, '');
        const filePath = resolve('./media', req.params.userId, req.params.roomId, filename);
        res.sendFile(filePath, (err: any) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // File not found
                    res.status(404).json({ message: 'Media file not found' });
                } else {
                    // Other errors (e.g., file read error)
                    res.status(500).json({ message: 'Internal Server Error' });
                }
            }
        });
    });
router.get('/*', (req, res) => {
    res.status(404).json({ message: "Media file not found" })
})


// POST /media/:userId/:roomId
router.post(
    '/:userId/:roomId',
    filterMediaAdmin,
    (req, res) => {
        try {
            const count = Number(req.query.count);
            if (count === 1) {
                multerUpload(req, res, (error) => {
                    if (error) {
                        return res.status(400).json({ message: 'Error uploading the file.', error: error.message });
                    }
                    if (!req.file) {
                        throw new Error("Missing file path");
                    }
                    // File uploaded successfully
                    res.status(200).json({ message: 'File uploaded successfully', urls: [req.file.path] });
                });
            } else if (count > 1) {
                multerUploadMany(req, res, (error) => {
                    if (error) {
                        return res.status(400).json({ message: 'Error uploading files.', error: error.message });
                    }
                    const fileUrls = Array.isArray(req.files) && req.files.map((file: any) => file.path);
                    if (!fileUrls) {
                        throw new Error("Missing files path");
                    }
                    // Files uploaded successfully
                    res.status(200).json({ message: 'Files uploaded successfully', urls: fileUrls });
                });
            } else {
                // Invalid 'count' value
                res.status(400).json({ message: 'Invalid "count" value. It should be a positive integer.' });
            }
        } catch (error) {
            console.error('Error uploading file(s):', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
);


export default router;


