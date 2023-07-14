import { ObjectId } from "mongodb";
import { updateDocument } from "../../controllers/mongodb";
// Function to update the participants list in the global chat room
const updateGlobalRoomUsersList = async (userId: ObjectId) => {
    try {
        const result = await updateDocument("rooms", { _id: globalThis.globalChatId }, { $push: { participants: userId } })
        console.log("Added " + result + " to the global chat room");
    } catch (err) {
        console.error('Failed to update global room users list:', err);
    }
};

export { updateGlobalRoomUsersList }