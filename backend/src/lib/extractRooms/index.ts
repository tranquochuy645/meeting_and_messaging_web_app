import { getDocuments } from "../../controllers/mongodb";
import { ObjectId } from "mongodb";
const getRoomIds = async (userId: string): Promise<any> => {
    try {
        let roomIds = await getDocuments(
            'users',
            { "_id": new ObjectId(userId) },
            { projection: { rooms: 1 } }
        );
        roomIds = roomIds[0].rooms.map(
            (id: string) => {
                return { "_id": new ObjectId(id) };
            }
        );
        return roomIds;
    } catch (error) {
        throw error;
    }
};


const getRoomsInfo = async (roomIds: ObjectId[]): Promise<any[]> => {
    try {
        return await getDocuments('rooms'
            , { $or: roomIds }
            , {
                projection: {
                    type: 1,
                    name: 1,
                    participants: 1
                }
            }
        );
    } catch (error) {
        throw error;
    }
}

const extractRooms = async (userId: string): Promise<any> => {
    try {
        const roomIds = await getRoomIds(userId);
        const roomsInfo = await getRoomsInfo(roomIds);
        const data = await Promise.all(
            roomsInfo.map(
                async (room: any) => {
                    //Filter out the user calling this
                    const participantIds = room.participants
                    // .filter(
                    //     (participant: string) => participant != userId
                    // );
                    //Get all the participants data of all rooms by ids
                    const participants = await getDocuments(
                        'users',
                        {
                            "_id": {
                                $in: participantIds.map(
                                    (id: string) => new ObjectId(id)
                                )
                            }
                        },
                        {
                            projection: {
                                fullname: 1,
                                avatar: 1,
                                isOnline: 1,
                                socketId: 1
                            }
                        }
                    );
                    const roomWithParticipantsData = {
                        _id: room._id,
                        participants
                    }
                    return roomWithParticipantsData;
                }
            )
        );
        return data;
    } catch (error) {
        throw error;
    }
};

export {
    extractRooms
}