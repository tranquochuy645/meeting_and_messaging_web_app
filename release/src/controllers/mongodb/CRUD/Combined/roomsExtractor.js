"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
/**
 * RoomsExtractor class for extracting room data based on user ID.
 */
class RoomsExtractor {
    /**
     * Create a new RoomsExtractor instance.
     * @param usersController - The users controller instance.
     * @param roomsController - The rooms controller instance.
     */
    constructor(usersController, roomsController) {
        this._usersController = usersController;
        this._roomsController = roomsController;
    }
    /**
     * Retrieve the room IDs based on the user ID.
     * @param userId - The user ID.
     * @returns A Promise resolving to the room IDs as an ObjectId[]
     */
    async getRoomIds(userId) {
        try {
            const result = await this._usersController.getRooms(userId);
            const roomIds = result === null || result === void 0 ? void 0 : result.rooms.map((id) => {
                return { _id: new mongodb_1.ObjectId(id) };
            });
            return roomIds;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Extract room data based on the user ID.
     * @param userId - The user ID.
     * @returns A Promise resolving to the extracted room data.
     */
    async extractRooms(userId) {
        try {
            const roomIds = await this.getRoomIds(userId);
            let data = [];
            if (roomIds.length > 0) {
                const roomsInfo = await this._roomsController.getParticipantLists({ $or: roomIds });
                data = await Promise.all(roomsInfo.map(async (room) => {
                    const participantIds = room.participants;
                    const participants = await this._usersController.readManyShortProfiles({
                        _id: {
                            $in: participantIds.map((id) => new mongodb_1.ObjectId(id)),
                        },
                    });
                    const roomWithParticipantsData = {
                        _id: room._id,
                        participants,
                    };
                    return roomWithParticipantsData;
                }));
            }
            return data;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Execute the room extraction process based on the user ID.
     * @param userId - The user ID.
     * @returns A Promise resolving to the extracted room data.
     */
    exec(userId) {
        return this.extractRooms(userId);
    }
}
exports.default = RoomsExtractor;
