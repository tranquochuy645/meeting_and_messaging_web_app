import { updateDocument } from "../../controllers/mongodb";
import { ObjectId } from "mongodb";

const onlineCheck = async (userId: string, socketId: string, online: boolean) => {
    try {
        const oid = new ObjectId(userId);
        // console.log(oid);
        const result = await updateDocument(
            "users",
            { "_id": oid },
            {
                isOnline: online,
                socketId: socketId,
                lastUpdate: new Date()
            }
        );
        if (!result) {
            throw new Error("User not found");
        }
        return result;
    } catch (error) {
        throw error;
    }
};

export { onlineCheck };
