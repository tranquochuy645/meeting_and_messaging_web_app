import { filterMediaAccess } from '../../middlewares/express/filterMediaAccess';
import { filterMediaAdmin } from '../../middlewares/express/filterMediaAdmin';
import { Router } from 'express';
import { GetObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import rateLimit from 'express-rate-limit';
import conf from '../../config';


const s3Client = new S3Client();


const router = Router();


const getLimiter = rateLimit({
    windowMs: 60 * 5000, // 5 minutes
    max: 50, // maximum number of requests allowed in the window for /auth route
    message: 'Too many requests from this IP, please try again later.',
});

// GET /media/:userId/:roomId/:filename?token=<token>
router.get('/:userId/:roomId/:filename',
    getLimiter,
    filterMediaAccess, // Middleware to check access to the media
    async (req, res) => {
        console.log(req.headers);
        // Ensure that the filename is properly sanitized to prevent directory traversal attacks
        // Remove any ".." to prevent traversal
        const filename = req.params.filename.replace(/\.\.\//g, '');
        const filePath = `media/${req.params.userId}/${req.params.roomId}/${filename}`;
        const getObjectParams = {
            "Bucket": conf.media_bucket,
            "Key": filePath,
        }

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
        res.redirect(url);
    }
);

const postLimiter = rateLimit({
    windowMs: 60 * 5000, // 5 minutes
    max: 5, // maximum number of requests allowed in the window for /auth route
    message: 'Too many requests from this IP, please try again later.',
});

// POST /media/:userId/:roomId
router.post(
    '/:userId/:roomId/:filename',
    postLimiter,
    filterMediaAdmin, // Middleware to check if the user has admin access
    async (req, res) => {
        try {
            // Handle single file upload
            const presignedPost = await createPresignedPost(
                s3Client,
                {
                    Bucket: conf.media_bucket,
                    Key: `media/${req.params.userId}/${req.params.roomId}/${req.params.filename}`,
                    Expires: 60, // URL expiration time in seconds
                }
            );
            // console.log(presignedPost);
            // Return the form fields and action URL to the client
            res.status(200).json(presignedPost);
        } catch (error) {
            console.error('Error generating pre-signed URL:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
);

// Route to handle all other all requests to /media/* (if doesnt match all routes above)
router.all('/*', (req, res) => {
    res.status(404).send("Media file not found")
})

export default router;
