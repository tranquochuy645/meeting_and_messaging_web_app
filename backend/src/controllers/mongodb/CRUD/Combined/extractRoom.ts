import { ObjectId } from "mongodb";
import { DbController as CTR} from "../../../../server";
const getRoomIds = async (userId: string): Promise<any> => {
    try {
        const result = await CTR.users.getRooms(userId);
        const roomIds = result?.rooms.map(
            (id: string) => {
                return { _id: new ObjectId(id) };
            }
        );
        return roomIds;
    } catch (error) {
        throw error;
    }
};




const extractRooms = async (userId: string): Promise<any> => {
    try {
        const roomIds = await getRoomIds(userId);
        let data: any[] = [];
        if (roomIds.length > 0) {
            const roomsInfo = await CTR.rooms.getParticipantLists({ $or: roomIds })
            data = await Promise.all(
                roomsInfo.map(
                    async (room: any) => {
                        //Filter out the user calling this
                        const participantIds = room.participants
                        //Get all the participants data of all rooms by ids
                        const participants = await CTR.users.readManyShortProfiles({
                            _id: {
                                $in: participantIds.map(
                                    (id: string) => new ObjectId(id)
                                )
                            }
                        })
                        const roomWithParticipantsData = {
                            _id: room._id,
                            participants
                        }
                        return roomWithParticipantsData;
                    }
                )
            );
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export {
    extractRooms
}