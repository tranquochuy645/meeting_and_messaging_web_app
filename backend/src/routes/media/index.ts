import { filterMediaAccess } from '../../middlewares/express/filterMediaAccess';
import { filterMediaAdmin } from '../../middlewares/express/filterMediaAdmin';
import { multerUpload, multerUploadMany } from '../../middlewares/express/multerUpload';
import { Router } from 'express';
import { resolve } from 'path';
import { Stream } from 'stream';
import { createReadStream } from 'fs';

const router = Router();

// GET /media/:userId/:roomId/:filename?token=<token>
router.get('/:userId/:roomId/:filename',
    filterMediaAccess, // Middleware to check access to the media
    (req, res) => {
        // Ensure that the filename is properly sanitized to prevent directory traversal attacks
        // Remove any ".." to prevent traversal
        const filename = req.params.filename.replace(/\.\.\//g, '');
        const filePath = resolve('./media', req.params.userId, req.params.roomId, filename);
        const r = createReadStream(filePath) // get a readable stream
        const ps = new Stream.PassThrough()
        Stream.pipeline(
            r,
            ps,
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(404).send("Media file not found");
                }
            }
        )
        ps.pipe(res)
    }
);



// POST /media/:userId/:roomId
router.post(
    '/:userId/:roomId',
    filterMediaAdmin, // Middleware to check if user has admin access
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


// Route to handle all other all requests to /media/* (if doesnt match all routes above)
router.all('/*', (req, res) => {
    res.status(404).send("Media file not found")
})

export default router;
