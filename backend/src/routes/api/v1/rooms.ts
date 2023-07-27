import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { verifyToken } from '../../../middlewares/express/jwt';
import { chatAppDbController as dc } from '../../../controllers/mongodb';
const router = Router();

// GET /api/v1/rooms/ 
// This endpoint returns list of rooms'info that the user has access to
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.headers.userId as string;
    const roomsInfo = await dc.users.extractRoomsList(userId)
    if (!roomsInfo) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(roomsInfo);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/v1/rooms/:id
router.get(
  '/:id',
  verifyToken,
  async (req, res) => {
    if (!ObjectId.isValid(req.params.id as string)) {
      return res.status(400).json({
        message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
      });
    }
    const skip = parseInt(req.query.skip as string, 10); // Parse the 'skip' parameter from the query string
    const limit = parseInt(req.query.limit as string, 10) || 30; // Parse the 'limit' parameter from the query string or set default to 30

    try {
      const data = await dc.rooms.getMessages(req.headers.userId as string, req.params.id as string, limit, skip); // Pass the 'limit' and 'skip' parameters to the getRoom function
      res.status(200).json(data);
    } catch (err) {
      console.error(err);
      // Not found or not a member of this room
      res.status(404).json({ message: 'Room not found' });
    }
  }
);




// POST /api/v1/rooms
router.post('/', verifyToken, async (req, res) => {
  // Create a new room logic here
  try {
    const creator_userId = req.headers.userId as string;
    if (!ObjectId.isValid(creator_userId)) {
      throw new Error("Invalid id")
    }
    const creator_userOId = new ObjectId(creator_userId)
    const oIdList = req.body.invited.map(
      (id: string) => {
        if (ObjectId.isValid(id)) {
          return new ObjectId(id)
        }
        throw new Error("Invalid id")
      }
    )

    const insertedRoom = await dc.rooms.createRoom(req.headers.userId as string, req.body.invited);
    // return modified count
    if (!insertedRoom) {
      throw new Error("Deo biet sao bug luon");
    }
    const updateCreatorRoomsList = await dc.users.joinRoom(
      creator_userId,
      insertedRoom.toString()
    );
    if (!updateCreatorRoomsList) {
      throw new Error("Error updating creator rooms list")
    }
    // return modified count
    const updateUsersInvitationList = await dc.users.updateMany(
      { _id: { $in: oIdList } },
      { $push: { invitations: insertedRoom } }
    )
    if (updateUsersInvitationList == oIdList.length) {
      return res.status(200).json({ message: "Created Room Successfully" });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad Request' });
  }
});

// PUT /api/v1/rooms/:id
router.put('/:id',
  verifyToken,
  async (req, res) => {
    // Update room by ID logic here
    if (
      !ObjectId.isValid(req.params.id as string) ||
      !ObjectId.isValid(req.headers.userId as string)
    ) return res.status(400).json({
      message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
    });
    try {
      if (req.body.accept == true) {
        const joinOk = await dc.users.joinRoom(req.headers.userId as string, req.params.id as string)
        if (!joinOk) {
          throw new Error("Couldn't add to rooms list")
        }
        const addOk = await dc.rooms.addParticipant(req.headers.userId as string, req.params.id as string)
        if (!addOk) {
          throw new Error("Couldn't add to participants list")
        }
      } else {
        const roomPullCount = await dc.rooms.pullFromInvitedList(req.headers.userId as string, req.params.id as string)
        if (!roomPullCount) {
          // Not found or not a member of this room
          return res.status(403).json({ message: 'Not invited' });
        }
        const userPullCount = await dc.users.pullFromInvitaionList(req.headers.userId as string, req.params.id as string)
        if (!userPullCount) {
          // Not found or not a member of this room
          return res.status(403).json({ message: 'Not invited' });
        }
      }
      res.status(200).json({ message: "ok" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

// DELETE /api/v1/rooms/:id
router.delete('/:id', (req, res) => {
  // Delete room by ID logic here
});

// Other room-related routes...

export default router;
