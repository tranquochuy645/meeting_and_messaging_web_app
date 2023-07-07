import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDocuments } from '../controllers/mongodb';
import { verifyToken } from '../middleware/jwt';
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
    try {
      oid = new ObjectId(req.params.id as string);
    } catch (err) {
      return res.status(400).json({
        message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
      });
    }
    getDocuments('rooms', { "_id": oid })
      .then((data) => {
        switch (data.length) {
          case 1:
            let dataToSend;
            try {
              const messagesLimit = 30; // Limit the number of messages to retrieve
              const latestMessages = data[0].messages.slice(-messagesLimit); // Get the latest messages based on the limit
              dataToSend = {
                type: data[0].type,
                participants: data[0].participants,
                messages: latestMessages,
              };
              res.status(200).json(dataToSend);
            } catch (err) {
              res.status(500).json({ message: 'Internal Server Error' });
            }
            break;
          case 0:
            res.status(404).json({ message: 'Room not found' });
            break;
          default:
            res.status(500).json({ message: 'Internal Server Error' });
            break;
        }
      });

  });


// POST /api/rooms
router.post('/', (req, res) => {
  // Create a new room logic here
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
