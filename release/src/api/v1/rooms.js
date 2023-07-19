"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const jwt_1 = require("../../middlewares/express/jwt");
const mongodb_2 = require("../../controllers/mongodb");
const router = (0, express_1.Router)();
// GET /api/v1/rooms/ 
// This endpoint returns list of rooms'info that the user has access to
router.get('/', jwt_1.verifyToken, async (req, res) => {
    try {
        const userId = req.headers.userId;
        const roomsInfo = await mongodb_2.chatAppDbController.roomsExtractor.exec(userId);
        res.status(200).json(roomsInfo);
    }
    catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// GET /api/v1/rooms/:id
router.get('/:id', jwt_1.verifyToken, async (req, res) => {
    if (!mongodb_1.ObjectId.isValid(req.params.id) ||
        !mongodb_1.ObjectId.isValid(req.headers.userId))
        return res.status(400).json({
            message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
        });
    try {
        const data = await mongodb_2.chatAppDbController.rooms.getRoom(req.headers.userId, req.params.id, 10);
        res.status(200).json(data);
    }
    catch (err) {
        // Not found or not a member of this room
        res.status(404).json({ message: 'Room not found' });
    }
});
// POST /api/v1/rooms
router.post('/', jwt_1.verifyToken, async (req, res) => {
    // Create a new room logic here
    try {
        const creator_userId = req.headers.userId;
        if (!mongodb_1.ObjectId.isValid(creator_userId)) {
            throw new Error("Invalid id");
        }
        const creator_userOId = new mongodb_1.ObjectId(creator_userId);
        const oIdList = req.body.invited.map((id) => {
            if (mongodb_1.ObjectId.isValid(id)) {
                return new mongodb_1.ObjectId(id);
            }
            throw new Error("Invalid id");
        });
        const newRoom = {
            type: "default",
            invited: oIdList,
            participants: [creator_userOId],
            messages: []
        };
        const insertedRoom = await mongodb_2.chatAppDbController.rooms.createRoom(newRoom);
        // return modified count
        if (!insertedRoom) {
            throw new Error("Deo biet sao bug luon");
        }
        const updateCreatorRoomsList = await mongodb_2.chatAppDbController.users.joinRoom(creator_userId, insertedRoom.insertedId.toString());
        if (!updateCreatorRoomsList) {
            throw new Error("Error updating creator rooms list");
        }
        // return modified count
        const updateUsersInvitationList = await mongodb_2.chatAppDbController.users.updateMany({ _id: { $in: oIdList } }, { $push: { invitations: insertedRoom.insertedId } });
        if (updateUsersInvitationList == oIdList.length) {
            return res.status(200).json({ message: "Created Room Successfully" });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Bad Request' });
    }
});
// PUT /api/v1/rooms/:id
router.put('/:id', jwt_1.verifyToken, async (req, res) => {
    // Update room by ID logic here
    if (!mongodb_1.ObjectId.isValid(req.params.id) ||
        !mongodb_1.ObjectId.isValid(req.headers.userId))
        return res.status(400).json({
            message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
        });
    try {
        if (req.body.accept == true) {
            const joinOk = await mongodb_2.chatAppDbController.users.joinRoom(req.headers.userId, req.params.id);
            if (!joinOk) {
                throw new Error("Couldn't add to rooms list");
            }
            const addOk = await mongodb_2.chatAppDbController.rooms.addParticipant(req.headers.userId, req.params.id);
            if (!addOk) {
                throw new Error("Couldn't add to participants list");
            }
        }
        else {
            const roomPullCount = await mongodb_2.chatAppDbController.rooms.pullFromInvitedList(req.headers.userId, req.params.id);
            if (!roomPullCount) {
                // Not found or not a member of this room
                return res.status(403).json({ message: 'Not invited' });
            }
            const userPullCount = await mongodb_2.chatAppDbController.users.pullFromInvitaionList(req.headers.userId, req.params.id);
            if (!userPullCount) {
                // Not found or not a member of this room
                return res.status(403).json({ message: 'Not invited' });
            }
        }
        res.status(200).json({ message: "ok" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// DELETE /api/v1/rooms/:id
router.delete('/:id', (req, res) => {
    // Delete room by ID logic here
});
// Other room-related routes...
exports.default = router;
