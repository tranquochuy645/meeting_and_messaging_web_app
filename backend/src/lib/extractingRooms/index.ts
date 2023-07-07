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


async function getRoomsInfo(roomIds: ObjectId[]): Promise<any[]> {
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
export {
    getRoomIds,
    getRoomsInfo
}