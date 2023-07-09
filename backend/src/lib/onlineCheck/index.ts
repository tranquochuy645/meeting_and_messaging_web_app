import { updateDocument } from "../../controllers/mongodb";
import { ObjectId } from "mongodb";

const onlineCheck = async (userId: string, socketId: string, online: boolean) => {
    try {
        const oid = new ObjectId(userId);
        let result;
        if (online) {
            result = await updateDocument(
                "users",
                { "_id": oid },
                {
                    $set: {
                        isOnline: online,
                        lastUpdate: new Date()
                    },
                    $push: {
                        socketId: socketId,
                    }
                }
            );
        } else {
            result = await updateDocument(
                "users",
                { "_id": oid },
                {
                    $set: {
                        isOnline: online,
                        lastUpdate: new Date()
                    },
                    $pull: {
                        socketId: socketId,
                    }
                }
            );
        }
        if (!result) {
            throw new Error("User not found");
        }
        return result;
    } catch (error) {
        throw error;
    }
};

export { onlineCheck };
