"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const generic_1 = require("./generic");
/**
 * RoomsController class for handling room-related operations.
 */
class RoomsController extends generic_1.CollectionReference {
    /**
     * Create a new room.
     * @param newRoom - The room object to be created.
     * @returns A Promise resolving to the result of the insertion operation.
     */
    createRoom(newRoom) {
        var _a;
        return (_a = this._collection) === null || _a === void 0 ? void 0 : _a.insertOne(newRoom);
    }
    /**
     * Retrieve the participant lists for rooms matching the filter.
     * @param filter - The filter criteria to find rooms.
     * @returns A Promise resolving to an array of room objects.
     * @throws Error if the room is not found or the user is not a member of the room.
     */
    async getParticipantLists(filter) {
        var _a;
        try {
            const result = await ((_a = this._collection) === null || _a === void 0 ? void 0 : _a.find(filter, {
                projection: {
                    _id: 1,
                    participants: 1
                }
            }).toArray());
            if (!result) {
                throw new Error("Room not found || Not a member of the room");
            }
            return result;
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Retrieve the room details for the given room ID and user.
     * @param whoSearch - The user searching for the room.
     * @param roomId - The ID of the room to retrieve.
     * @param messagesLimit - The limit of messages to retrieve.
     * @returns A Promise resolving to the room details object.
     * @throws Error if the room is not found or the user is not a member of the room.
     */
    async getRoom(whoSearch, roomId, messagesLimit) {
        var _a;
        try {
            let room = await ((_a = this._collection) === null || _a === void 0 ? void 0 : _a.findOne({
                _id: new mongodb_1.ObjectId(roomId),
                participants: { $in: [new mongodb_1.ObjectId(whoSearch)] }
            }, {
                projection: {
                    _id: 0,
                    participants: 1,
                    messages: 1
                }
            }));
            if (!room) {
                throw new Error("Room not found || Not a member of the room");
            }
            room.messages = room.messages.slice(-messagesLimit);
            return room;
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Add a user to the invited list of a room.
     * @param userId - The ID of the user to add to the invited list.
     * @param roomId - The ID of the room.
     * @returns A Promise resolving to the count of modified documents.
     */
    async pushToInvitedList(userId, roomId) {
        var _a;
        try {
            const result = await ((_a = this._collection) === null || _a === void 0 ? void 0 : _a.updateOne({
                _id: new mongodb_1.ObjectId(roomId)
            }, {
                $push: {
                    invited: new mongodb_1.ObjectId(userId)
                }
            }));
            return result === null || result === void 0 ? void 0 : result.modifiedCount;
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Remove a user from the invited list of a room.
     * @param whoAsked - The ID of the user requesting the removal.
     * @param roomId - The ID of the room.
     * @returns A Promise resolving to the count of modified documents.
     */
    async pullFromInvitedList(whoAsked, roomId) {
        var _a;
        try {
            const result = await ((_a = this._collection) === null || _a === void 0 ? void 0 : _a.updateOne({
                _id: new mongodb_1.ObjectId(roomId)
            }, {
                $pull: {
                    invited: new mongodb_1.ObjectId(whoAsked)
                }
            }));
            return result === null || result === void 0 ? void 0 : result.modifiedCount;
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Add a participant to a room and remove them from the invited list.
     * @param whoAsked - The ID of the user requesting the addition.
     * @param roomId - The ID of the room.
     * @returns A Promise resolving to the count of modified documents.
     */
    async addParticipant(whoAsked, roomId) {
        var _a;
        try {
            const result = await ((_a = this._collection) === null || _a === void 0 ? void 0 : _a.updateOne({
                _id: new mongodb_1.ObjectId(roomId)
            }, {
                $push: { participants: new mongodb_1.ObjectId(whoAsked) },
                $pull: { invited: new mongodb_1.ObjectId(whoAsked) }
            }));
            return result === null || result === void 0 ? void 0 : result.modifiedCount;
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Save a message in a room.
     * @param sender - The ID of the message sender.
     * @param roomId - The ID of the room.
     * @param content - The content of the message.
     * @param timestamp - The timestamp of the message.
     */
    async saveMessage(sender, roomId, content, timestamp) {
        var _a;
        try {
            const data = {
                sender: new mongodb_1.ObjectId(sender),
                content,
                timestamp
            };
            const result = await ((_a = this._collection) === null || _a === void 0 ? void 0 : _a.updateOne({ _id: new mongodb_1.ObjectId(roomId) }, { $push: { messages: data } }));
            console.log("Saved message: " + (result === null || result === void 0 ? void 0 : result.modifiedCount));
        }
        catch (e) {
            console.error("Error saving message: " + e);
        }
    }
}
exports.default = RoomsController;
