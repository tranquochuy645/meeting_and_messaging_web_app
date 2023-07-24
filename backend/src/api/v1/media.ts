import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { verifyToken } from '../../middlewares/express/jwt';
import { chatAppDbController as dc } from '../../controllers/mongodb';
const router = Router();

// GET /api/v1/media/ 
// This endpoint returns list of rooms'info that the user has access to
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.headers.userId as string; // the user who asking for this media
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});