import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDocuments, insertDocument, updateDocument, updateManyDocuments } from '../controllers/mongodb';
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
    let Roid; //Room oid
    let Uoid; //User oid
    try {
      Roid = new ObjectId(req.params.id as string);
      Uoid = new ObjectId(req.headers.userId as string);
    } catch (err) {
      return res.status(400).json({
        message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
      });
    }
    getDocuments('rooms', { "_id": Roid, "participants": { $in: [Uoid] } }, { projection: { _id: 0, type: 1, participants: 1, messages: 1 } })
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
    const newRoom = {
      type: "default",
      invited: oIdList,
      participants: [creator_userOId],
      messages: []
    }
    const insertedRoom = await insertDocument("rooms", newRoom);
    // return modified count
    const updateCreatorInvitationList = await updateDocument(
      "users",
      { _id: creator_userOId },
      { $push: { rooms: insertedRoom.insertedId } }
    );
    if (!updateCreatorInvitationList) {
      throw new Error("Error updating creator rooms list")
    }
    // return modified count
    const updateUsersInvitationList = await updateManyDocuments("users",
      { _id: { $in: oIdList } },
      { $push: { invitations: insertedRoom.insertedId } }
    );
    if (updateUsersInvitationList == oIdList.length) {
      return res.status(200).json({ message: "Created Room Successfully" });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad Request' });
  }
});

// PUT /api/rooms/:id
router.put('/:id',
  verifyToken,
  async (req, res) => {
    // Update room by ID logic here
    let Roid;
    let Uoid;
    try {
      Roid = new ObjectId(req.params.id as string); // room oid
      Uoid = new ObjectId(req.headers.userId as string); // user oid
    } catch (err) {
      return res.status(400).json({
        message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
      });
    }
    try {
      const result = await getDocuments('rooms', { _id: Roid, "invited": { $in: [Uoid] } }, { projection: { _id: 0, invited: 1 } })
      if (result.length == 0) {
        // Not found or not a member of this room
        return res.status(403).json({ message: 'Not invited' });
      }
      const updateUserInvitations = await updateDocument(
        "users",
        { _id: Uoid },
        { $pull: { invitations: Roid } }
      )
      if (!updateUserInvitations) {
        throw new Error("Couldn't update invitations list")
      }
      const updateRoomInvitedList = await updateDocument(
        "rooms",
        { _id: Roid },
        { $pull: { invited: Uoid } }
      )
      if (!updateRoomInvitedList) {
        throw new Error("Couldn't update invited list")
      }
      if (req.body.accept == true) {
        const updateUserRoomsList = await updateDocument(
          "users",
          { _id: Uoid },
          { $push: { rooms: Roid } }
        )
        if (!updateUserRoomsList) {
          throw new Error("Couldn't update rooms list")
        }
        const updateParticipantsList = await updateDocument(
          "rooms",
          { _id: Roid },
          { $push: { participants: Uoid } }
        )
        if (!updateParticipantsList) {
          throw new Error("Couldn't update participants list")
        }
      }
      res.status(200).json({ message: "ok" });

    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }

  });

// DELETE /api/rooms/:id
router.delete('/:id', (req, res) => {
  // Delete room by ID logic here
});

// Other room-related routes...

export default router;
