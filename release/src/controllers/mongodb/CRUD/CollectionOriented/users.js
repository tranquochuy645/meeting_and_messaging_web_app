"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const generic_1 = require("./generic");
/**
 * UsersController class for handling user-related operations.
 */
class UsersController extends generic_1.CollectionReference {
    /**
     * Check if a username is available.
     * @param username - The username to check availability.
     * @returns A Promise resolving to a boolean indicating if the username is available.
     */
    async checkAvailableUserName(username) {
        var _a;
        const result = await ((_a = this._collection) === null || _a === void 0 ? void 0 : _a.findOne({ username }));
        return !result;
    }
    /**
     * Create a new user.
     * @param newUser - The user object to be created.
     * @returns A Promise resolving to the result of the insertion operation.
     */
    createUser(newUser) {
        var _a;
        return (_a = this._collection) === null || _a === void 0 ? void 0 : _a.insertOne(newUser);
    }
    /**
     * Read the full profile of a user.
     * @param id - The ID of the user.
     * @returns A Promise resolving to the user's profile object.
     */
    readProfile(id) {
        var _a;
        return (_a = this._collection) === null || _a === void 0 ? void 0 : _a.findOne({ _id: new mongodb_1.ObjectId(id) }, { projection: { password: 0 } });
    }
    /**
     * Read the short profile of a user.
     * @param id - The ID of the user.
     * @returns A Promise resolving to the user's short profile object.
     */
    readShortProfile(id) {
        var _a;
        return (_a = this._collection) === null || _a === void 0 ? void 0 : _a.findOne({ _id: new mongodb_1.ObjectId(id) }, {
            projection: {
                fullname: 1,
                avatar: 1,
                isOnline: 1,
            }
        });
    }
    /**
     * Read the short profiles of multiple users matching the filter.
     * @param filter - The filter criteria to find users.
     * @returns A Promise resolving to an array of user short profile objects.
     */
    readManyShortProfiles(filter) {
        var _a;
        return (_a = this._collection) === null || _a === void 0 ? void 0 : _a.find(filter, {
            projection: {
                fullname: 1,
                avatar: 1,
                isOnline: 1,
            }
        }).toArray();
    }
    /**
     * Update a user's information.
     * @param id - The ID of the user.
     * @param data - The updated data for the user.
     * @returns A Promise resolving to the result of the update operation.
     */
    updateUser(id, data) {
        var _a;
        return (_a = this._collection) === null || _a === void 0 ? void 0 : _a.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: data });
    }
    /**
     * Delete a user.
     * @param id - The ID of the user to be deleted.
     * @returns A Promise resolving to the result of the deletion operation.
     */
    //   public deleteUser(id: string): Promise<any> {
    //     // TODO: Implement user deletion logic.
    //   }
    /**
     * Get the password of a user.
     * @param username - The username of the user.
     * @returns A Promise resolving to the user's password.
     */
    getPassword(username) {
        var _a;
        return (_a = this._collection) === null || _a === void 0 ? void 0 : _a.findOne({ username: username }, { projection: { password: 1 } });
    }
    /**
     * Set the online status of a user.
     * @param id - The ID of the user.
     * @param isOnline - The online status to set.
     * @returns A Promise resolving to the result of the update operation.
     */
    setStatus(id, isOnline) {
        var _a;
        return (_a = this._collection) === null || _a === void 0 ? void 0 : _a.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { isOnline: isOnline, lastUpdate: new Date() } });
    }
    /**
     * Get the rooms of a user.
     * @param id - The ID of the user.
     * @returns A Promise resolving to the user's rooms object. { rooms: ObjectId[] }
     */
    getRooms(id) {
        var _a;
        return (_a = this._collection) === null || _a === void 0 ? void 0 : _a.findOne({ _id: new mongodb_1.ObjectId(id) }, { projection: { _id: 0, rooms: 1 } });
    }
    /**
     * Remove a room ID from the invitation list of a user.
     * @param userId - The ID of the user.
     * @param roomId - The ID of the room to remove from the invitation list.
     * @returns A Promise resolving to the count of modified documents.
     */
    async pullFromInvitaionList(userId, roomId) {
        var _a;
        try {
            const result = await ((_a = this._collection) === null || _a === void 0 ? void 0 : _a.updateOne({ _id: new mongodb_1.ObjectId(userId) }, {
                $pull: { invitations: new mongodb_1.ObjectId(roomId) }
            }));
            return result === null || result === void 0 ? void 0 : result.modifiedCount;
        }
        catch (e) {
            throw e;
        }
    }
    /**
     * Add a room ID to the rooms list of a user and remove it from the invitation list.
     * @param userId - The ID of the user.
     * @param roomId - The ID of the room to join.
     * @returns A Promise resolving to the count of modified documents.
     */
    async joinRoom(userId, roomId) {
        var _a;
        try {
            const result = await ((_a = this._collection) === null || _a === void 0 ? void 0 : _a.updateOne({ _id: new mongodb_1.ObjectId(userId) }, {
                $push: { rooms: new mongodb_1.ObjectId(roomId) },
                $pull: { invitations: new mongodb_1.ObjectId(roomId) }
            }));
            return result === null || result === void 0 ? void 0 : result.modifiedCount;
        }
        catch (e) {
            throw e;
        }
    }
    /**
     * Remove a room ID from the rooms list of a user.
     * @param userId - The ID of the user.
     * @param roomId - The ID of the room to leave.
     * @returns A Promise resolving to the result of the update operation.
     */
    leaveRoom(userId, roomId) {
        var _a;
        return (_a = this._collection) === null || _a === void 0 ? void 0 : _a.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $pull: { rooms: new mongodb_1.ObjectId(roomId) } });
    }
    /**
     * Search for users matching a query.
     * @param whoSearch - The ID of the user performing the search.
     * @param query - The search query.
     * @param limit - The maximum number of results to return.
     * @returns A Promise resolving to an array of matching user objects.
     */
    search(whoSearch, query, limit) {
        var _a;
        return (_a = this._collection) === null || _a === void 0 ? void 0 : _a.find({
            fullname: new RegExp(query, "i"),
            _id: { $ne: new mongodb_1.ObjectId(whoSearch) }
        }, { projection: { _id: 1, fullname: 1, avatar: 1 } }).limit(limit).toArray();
    }
    /**
     * Update multiple users matching a filter.
     * @param filter - The filter criteria to find users.
     * @param update - The update to be applied to the matching users.
     * @returns A Promise resolving to the count of modified documents.
     */
    async updateMany(filter, update) {
        var _a;
        try {
            const result = await ((_a = this._collection) === null || _a === void 0 ? void 0 : _a.updateMany(filter, update));
            return result === null || result === void 0 ? void 0 : result.modifiedCount;
        }
        catch (e) {
            throw e;
        }
    }
}
exports.default = UsersController;
