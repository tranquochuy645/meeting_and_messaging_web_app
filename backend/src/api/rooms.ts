import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDocuments, insertDocument } from '../controllers/mongodb';
import { verifyToken } from '../middleware/express/jwt';
import { extractRooms } from '../lib/extractRooms';
const router = Router();

// GET /api/rooms/ 
// This endpoint returns list of rooms'info that the user has access to
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.headers.userId as string;
    const roomsInfo = await extractRooms(userId);
    res.status(200).json(roomsInfo);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/rooms/:id
router.get(
  '/:id',
  verifyToken,
  (req, res) => {
    let oid;
    let Uoid;
    try {
      oid = new ObjectId(req.params.id as string);
      Uoid = new ObjectId(req.headers.userId as string);
    } catch (err) {
      return res.status(400).json({
        message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
      });
    }
    getDocuments('rooms', { "_id": oid, "participants": { $in: [Uoid] } }, { projection: { _id: 0, type: 1, participants: 1, messages: 1 } })
      .then((data) => {
        switch (data.length) {
          case 1:
            // User is a member of this room
            res.status(200).json(data[0]);
            break;
          case 0:
            // Not found or not a member of this room
            res.status(404).json({ message: 'Room not found' });
            break;
          default:
            res.status(500).json({ message: 'Internal Server Error' });
            break;
        }
      });

  });


// POST /api/rooms
router.post('/:userid', verifyToken, (req, res) => {
  // Create a new room logic here
  // const creator_userId=req.headers.userId;
  // const invited_userId=req.params.userid;
  // const participants =[creator_userId, invited_userId];
  // directChat.participants=participants;
  // insertDocument('rooms',directChat)
});

// PUT /api/rooms/:id
router.put('/:id', (req, res) => {
  // Update room by ID logic here
});

// DELETE /api/rooms/:id
router.delete('/:id', (req, res) => {
  // Delete room by ID logic here
});

// Other room-related routes...

export default router;
