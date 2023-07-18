import { ObjectId } from "mongodb";
import { CollectionReference } from "./generic";
export class RoomsController extends CollectionReference {
    public createRoom(newRoom: any) {
        return this._collection?.insertOne(newRoom);
    }
    public async getParticipantLists(filter: any) {
        try {
            const result = await this._collection?.find(
                filter,
                {
                    projection: {
                        _id: 1,
                        participants: 1
                    }
                }
            ).toArray()
            if (!result) {
                throw new Error("Room not found || Not a member of the room")
            }
            return result
        } catch (err) {
            throw err
        }
    }
    public async getRoom(whoSearch: string, roomId: string, messagesLimit: number) {
        try {
            let room = await this._collection?.findOne(
                {
                    _id: new ObjectId(roomId),
                    participants: { $in: [new ObjectId(whoSearch)] }
                },
                {
                    projection: {
                        _id: 0,
                        participants: 1,
                        messages: 1
                    }
                }
            )
            if (!room) {
                throw new Error("Room not found || Not a member of the room")
            }
            room.messages = room.messages.slice(-messagesLimit);
            return room;
        } catch (err) {
            throw err
        }
    }
    public async pushToInvitedList(userId: string, roomId: string) {
        try {
            const result = await this._collection?.updateOne(
                {
                    _id: new ObjectId(roomId)
                },
                {
                    $push: {
                        invited: new ObjectId(userId)
                    }
                }
            )
            return result?.modifiedCount
        } catch (err) {
            throw err
        }
    }
    public async pullFromInvitedList(whoAsked: string, roomId: string) {
        try {
            const result = await this._collection?.updateOne(
                {
                    _id: new ObjectId(roomId)
                },
                {
                    $pull: {
                        invited: new ObjectId(whoAsked)
                    }
                }
            )
            return result?.modifiedCount
        } catch (err) {
            throw err
        }
    }
    public async addParticipant(whoAsked: string, roomId: string) {
        try {
            const result = await this._collection?.updateOne(
                {
                    _id: new ObjectId(roomId)
                },
                {
                    $push: { participants: new ObjectId(whoAsked) },
                    $pull: { invited: new ObjectId(whoAsked) }
                }
            )
            return result?.modifiedCount
        } catch (err) {
            throw err
        }
    }
    public async saveMessage(sender: string, roomId: string, content: string, timestamp: string) {
        try {
            const data = {
                sender: new ObjectId(sender),
                content,
                timestamp
            }
            const result = await this._collection?.updateOne(
                { _id: new ObjectId(roomId) },
                { $push: { messages: data } }
            )
            console.log("Saved message: " + result?.modifiedCount)
        } catch (e) {
            console.error("Error saving message: " + e);
        }
    }

}

