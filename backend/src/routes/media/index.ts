import { MulterError } from 'multer';
import { filterMediaAccess } from '../../middlewares/express/filterMediaAccess';
import { filterMediaAdmin } from '../../middlewares/express/filterMediaAdmin';
import { multerUpload } from '../../middlewares/express/multerUpload';
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

// POST /media/upload
// This endpoint handles file uploads
router.post('/:userId/:roomId',
    filterMediaAdmin,
    multerUpload,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            // Check for any errors during file upload
            if (req.file instanceof MulterError) {
                return res.status(400).json({ message: 'File upload error', error: req.file.message });
            }

            // Process the uploaded file using FileWriter or save it to a database
            // Respond with success message
            res.status(200).json({ message: 'File uploaded successfully', url: req.file.path });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });


export default router;