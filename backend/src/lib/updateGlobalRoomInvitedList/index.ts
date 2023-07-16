import { ObjectId } from "mongodb";
import { updateDocument } from "../../controllers/mongodb";
// Function to update the participants list in the global chat room
const updateGlobalRoomInvitedList = async (userId: ObjectId) => {
    try {
        const result = await updateDocument(
            "rooms",
            { _id: globalThis.globalChatId },
            { $push: { invited: userId } }
        )
        if (!result) { throw new Error("Couldn't invite user to global chat") }
        console.log("Added " + result + " to the global chat room");
    } catch (err: any) {
        console.error(err.message);
    }
};

export { updateGlobalRoomInvitedList }