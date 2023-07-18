import { ObjectId } from "mongodb"
import { rooms as roomsCRUD } from "../../controllers/mongodb"
export const saveMessage = async (sender: string, roomId: string, content: string, timestamp: string) => {
    const data = {
        sender: new ObjectId(sender),
        content,
        timestamp
    }
    try {
        const result = await roomsCRUD.saveMessage(roomId, data)
        console.log("Saved message: " + result?.modifiedCount);
    } catch (e) {
        console.error("Error saving message: " + e);
    }
}