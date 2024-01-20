import { getTokenPayload } from "../../../lib/getTokenPayload";
import { ObjectId } from "mongodb";
import { chatAppDbController as dc } from "../../../controllers/mongodb";
export const filterMediaAccess = async (req: any, res: any, next: any) => {
    if (!ObjectId.isValid(req.params.userId)) {
        return res.status(404).json({
            message: "User not found",
        });
    }
    if (req.params.roomId === "public") {
        return next()
    }
    if (!ObjectId.isValid(req.params.roomId)) {
        return res.status(404).json({
            message: "Room not found",
        });
    }
    if (!req.query.token) {
        return res.status(403).json({
            message: "Token is required",
        });
    }
    try {
        const { userId } = getTokenPayload(req.query.token as string);
        let rooms: ObjectId[] | string[] = await dc.users.getRoomsList(userId)
        rooms = rooms.map(room => room.toString())
        if (!rooms || rooms.length == 0) {
            throw new Error("Not a member of the room")
        }
        if (rooms.includes(req.params.roomId)) {
            return next()
        }
        throw new Error("Not a member of the room")
    } catch (err: any) {
        res.status(403).json({ message: err.message });
    }
}