import { updateDocument } from "../../controllers/mongodb"
import { ObjectId } from "mongodb"
export const saveMessage = async (sender: string, content: string, timestamp: string, roomId: string) => {
    const data = {
        sender: new ObjectId(sender),
        content,
        timestamp
    }
    const oid = new ObjectId(roomId);
    try {
        const result = await updateDocument("rooms", { _id: oid }, { $push: { messages: data } })
        console.log("Saved message: " + result);
    } catch (e) {
        console.log(data);
        console.error("Error saving message: " + e);
    }
}