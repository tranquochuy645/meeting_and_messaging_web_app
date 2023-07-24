import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { verifyToken } from '../../middlewares/express/jwt';
import { chatAppDbController as dc } from '../../controllers/mongodb';
const router = Router();

// GET /api/v1/media/:id
// This endpoint returns list of rooms'info that the user has access to
router.get('/:id', verifyToken, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id as string)) {
            return res.status(400).json({
                message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
            });
        }
        const media = await dc.media.getMediaById(req.params.id, req.headers.userId as string);
        res.status(200).json(media);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
export default router;