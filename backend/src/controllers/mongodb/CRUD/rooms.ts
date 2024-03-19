import { ObjectId } from "mongodb";
import { CollectionReference } from "./generic";
import { ConversationData } from "../interfaces";
import { timeStamp } from "console";


/**
 * Interface representing the structure of a room.
 */
interface Room {
  type: "global" | "default"; // Type can only be "global" or "default"
  admin: ObjectId;
  invited: ObjectId[];
  participants: ObjectId[];
  messages: any[]; // Replace 'any' with the actual type of the messages
  readCursors: ReadCursor[]
  isMeeting: boolean; // Additional field to indicate if the room is a meeting
  meeting_uuid: string | null; // Additional field to store the meeting UUID or null if not a meeting
}

class ReadCursor {
  public _id: ObjectId;
  public lastReadTimeStamp: Date | null;
  constructor(id: string, date?: Date) {
    this._id = new ObjectId(id);
    this.lastReadTimeStamp = date || null;
  }
}
/**
* Room class representing a room object.
*/
class Room {
  /**
   * Create a new Room object.
   * @param creator - The ID of the user creating the room (room owner).
   * @param invited - An array of user IDs to invite to the room.
   * @param type - Optional. The type of the room. Default is "default".
   */
  constructor(creator: string, invited: string[], type: "global" | "default" = "default") {
    if (!ObjectId.isValid(creator))
      throw new Error("Invalid creator user id");

    // Validate the type field to allow only "global" or "default"
    if (type !== "global" && type !== "default") {
      throw new Error("Invalid value for 'type' field. It should be 'global' or 'default'.");
    }

    this.type = type;
    this.admin = new ObjectId(creator);
    this.invited = invited.map(id => {
      if (!ObjectId.isValid(id))
        throw new Error("Invalid invited id");
      return new ObjectId(id);
    });
    this.participants = [new ObjectId(creator)];
    this.messages = [];
    this.readCursors = [new ReadCursor(creator)]
    this.isMeeting = false; // Set the default value for isMeeting
    this.meeting_uuid = null; // Set the default value for meeting_uuid
  }
}



/**
 * RoomsController class for handling room-related operations.
 */
export default class RoomsController extends CollectionReference {
  /**
   * Create a new room.
   * @param newRoom - The room object to be created.
   * @returns A Promise resolving to the inserted room objectId
   */
  public async createRoom(creator: string,
    invited: string[],
    type: "global" | "default" | undefined = "default"): Promise<ObjectId> {
    try {
      const result = await this._collection.insertOne(new Room(creator, invited, type));
      if (result && result.insertedId) {
        return result.insertedId;
      }
      throw new Error("Room insertion failed.");
    } catch (err: any) {
      const errStacked = new Error(`Error in createRoom: ${err.message}`);
      throw errStacked;
    }
  }

  /**
   * Retrieve the participant lists for rooms matching the filter.
   * @param roomIds - An array of room IDs to retrieve information for.
   * @returns A Promise resolving to an array of room objects.
   * @throws Error if the room is not found or the user is not a member of the room.
   */
  public async getRoomsInfo(roomOIds: ObjectId[]): Promise<any> {
    try {
      // Use the $in operator to find rooms with matching _id in the provided array of roomIds
      const result = await this._collection.find(
        { _id: { $in: roomOIds } }, // Use $in operator to match any of the provided roomIds
        {
          projection: {
            _id: 1,
            participants: 1,
            isMeeting: 1,
            meeting_uuid: 1
          }
        }
      ).toArray();

      if (!result || result.length === 0) {
        throw new Error("Room not found or user is not a member of the room");
      }

      return result;
    } catch (err: any) {
      const errStacked = new Error(`Error in getRoomsInfo: ${err.message}`);
      throw errStacked;
    }
  }
  /**
   * Retrieve the room details for the given room ID and user.
   * @param whoSearch - The user searching for the room.
   * @param roomId - The ID of the room to retrieve.
   * @param messagesLimit - The limit of messages to retrieve.
   * @param skip - Optional. The number of messages to skip from the beginning.
   * @returns A Promise resolving to the room details object.
   * @throws Error if the room is not found or the user is not a member of the room.
   */
  public async getConversationData(whoSearch: string, roomId: string, messagesLimit: number, skip?: number): Promise<ConversationData | null> {
    try {
      const room = await this._collection.findOne(
        {
          _id: new ObjectId(roomId),
          participants: new ObjectId(whoSearch)
        },
        {
          projection: {
            _id: 0,
            messages: {
              $slice: Number.isInteger(skip) ? [skip, messagesLimit] : -messagesLimit
            },
            conversationLength: { $cond: { if: { $isArray: "$messages" }, then: { $size: "$messages" }, else: "NA" } },
            readCursors: 1
          }
        }
      );

      return room as ConversationData;
    } catch (err: any) {
      const errStacked = new Error(`Error in getMessages: ${err.message}`);
      throw errStacked;
    }
  }

  /**
   * findMessages() method for searching messages in a room.
   * @param whoSearch - The ID of the user searching for messages.
   * @param roomId - The ID of the room to search for messages.
   * @param regex - The string to match against message content.
   * @returns A Promise resolving to an array of Message objects
   * @throws Error if the room is not found or the user is not a member of the room.
   */

  public async findMessages(whoSearch: string, roomId: string, regex: string) {
    try {
      const room = await this._collection.aggregate([
        {
          $match: {
            _id: new ObjectId(roomId), // room id
            participants: new ObjectId(whoSearch) // user id must be in room's participants list
          }
        },
        {
          $project: {
            _id: 0,
            filtered: {
              $map: {
                input: {
                  $filter: {
                    input: { $range: [0, { $size: "$messages" }] }, // Generate an array of indices
                    as: "index",
                    cond: {
                      $regexMatch: {
                        input: { $arrayElemAt: ["$messages.content", "$$index"] }, // Get the content of the message at the corresponding index
                        regex: regex // The regular expression to match against message content
                      }
                    }
                  }
                },
                as: "index",
                in: {
                  $mergeObjects: [
                    { $arrayElemAt: ["$messages", "$$index"] }, // Get the message object at the corresponding index
                    { index: "$$index" } // Insert the index field with its value
                  ]
                }
              }
            }
          }
        }
      ]).toArray();
      
      if (!room) {
        throw new Error("Something is wrong with the query");
      }
      if (!room[0]) {
        return [1, null]; // Access denied or not found
      }
      return [0, room[0].filtered];
    } catch (err: any) {
      const errStacked = new Error(`Error in findMessages: ${err.message}`);
      throw errStacked;
    }
  }


  /**
   * Add a user to the invited list of a room.
   * @param userId - The ID of the user to add to the invited list.
   * @param roomId - The ID of the room.
   * @returns A Promise resolving to the count of modified documents.
   */
  public async addToInvitedList(userId: string, roomId: string): Promise<number | undefined> {
    try {
      const result = await this._collection.updateOne(
        {
          _id: new ObjectId(roomId)
        },
        {
          $addToSet: {
            invited: new ObjectId(userId)
          }
        }
      );

      return result?.modifiedCount;
    } catch (err: any) {
      const errStacked = new Error(`Error in addToInvitedList: ${err.message}`);
      throw errStacked;
    }
  }

  /**
   * Remove a user from the invited list of a room.
   * @param whoAsked - The ID of the user requesting the removal.
   * @param roomId - The ID of the room.
   * @returns A Promise resolving to the count of modified documents.
   */
  public async pullFromInvitedList(whoAsked: string, roomId: string): Promise<number | undefined> {
    try {
      const result = await this._collection.updateOne(
        {
          _id: new ObjectId(roomId)
        },
        {
          $pull: {
            invited: new ObjectId(whoAsked)
          }
        }
      );

      return result?.modifiedCount;
    } catch (err: any) {
      const errStacked = new Error(`Error in pullFromInvitedList: ${err.message}`);
      throw errStacked;
    }
  }

  /**
   * Add a participant to a room and remove them from the invited list.
   * @param whoAsked - The ID of the user requesting the addition.
   * @param roomId - The ID of the room.
   * @returns A Promise resolving to the count of modified documents.
   */
  public async addParticipant(whoAsked: string, roomId: string): Promise<number | undefined> {
    try {
      const result = await this._collection.updateOne(
        {
          _id: new ObjectId(roomId),
          invited: { $elemMatch: { $eq: new ObjectId(whoAsked) } }
        },
        {
          $addToSet: { participants: new ObjectId(whoAsked), readCursors: new ReadCursor(whoAsked) },
          $pull: { invited: new ObjectId(whoAsked) }
        }
      );

      return result?.modifiedCount;
    } catch (err: any) {
      const errStacked = new Error(`Error in addParticipant: ${err.message}`);
      throw errStacked;
    }
  }
  /**
   * Remove a user from all rooms where they are present as a participant or invited.
   * @param userId - The ID of the user to be removed from rooms.
   * @returns A Promise resolving to the count of modified documents.
   */
  public async removeUserFromAllRooms(userId: string): Promise<number | undefined> {
    try {
      // Filter to find rooms where the user is a participant or invited
      const filter = {
        $or: [
          { participants: new ObjectId(userId) },
          { invited: new ObjectId(userId) }
        ]
      };

      // Update operation to remove the user from participants and invited arrays
      const update = {
        $pull: {
          readCursors: { $elematch: { _id: new ObjectId(userId) } },
          participants: new ObjectId(userId),
          invited: new ObjectId(userId),
        },
      };

      // Use find to get all matching rooms
      const rooms = await this._collection.find(filter, { projection: { _id: 1 } }).toArray();
      let modifiedCount = 0;

      // Use a for...of loop to ensure each update operation is executed sequentially
      for (const room of rooms) {
        const result = await this._collection.updateOne({ _id: new ObjectId(room._id) }, update);
        if (result?.modifiedCount) {
          modifiedCount += result.modifiedCount;
        }
      }

      return modifiedCount;
    } catch (err: any) {
      const errStacked = new Error(`Error in removeUserFromAllRooms: ${err.message}`);
      throw errStacked;
    }
  }

  /**
  * Set the meeting status and UUID for a room.
  * @param roomId - The ID of the room.
  * @param uuid - Optional. The UUID of the meeting.
  *              If uuid is not provided, isMeeting is set to false, and the current UUID will be removed.
  *              Otherwise, a new UUID will be set, and isMeeting will be set to true.
  * @returns A Promise resolving to the count of modified documents.
  */
  public setMeeting(roomId: string, uuid?: string) {
    if (uuid)
      return this._collection.updateOne(
        { _id: new ObjectId(roomId) },
        { $set: { isMeeting: true, meeting_uuid: uuid } }
      )
    return this._collection.updateOne(
      { _id: new ObjectId(roomId) },
      { $set: { isMeeting: false, meeting_uuid: null } }
    )
  }


  /**
 * Check the meeting status and UUID for a room.
 * @param roomId - The ID of the room.
 * @returns A Promise resolving to an object containing meeting information.
 *          If the room is not found, it will return null.
 */
  public async checkMeeting(roomId: string): Promise<{ isMeeting: boolean; meeting_uuid: string | null } | null> {
    try {
      const result = await this._collection.findOne(
        { _id: new ObjectId(roomId) },
        {
          projection: {
            _id: 0,
            isMeeting: 1,
            meeting_uuid: 1
          }
        }
      );

      if (!result) {
        // If the room is not found, return null
        return null;
      }

      // Otherwise, return the meeting information
      return {
        isMeeting: !!result.isMeeting,
        meeting_uuid: result.meeting_uuid || null
      };
    } catch (err: any) {
      const errStacked = new Error(`Error in checkMeeting: ${err.message}`);
      throw errStacked;
    }
  }

  /**
 * Save a message in a room.
 * @param sender - The ID of the message sender.
 * @param roomId - The ID of the room.
 * @param content - The content of the message.
 * @param timestamp - The timestamp of the message.
 * @throws Error if there's an issue while saving the message.
 */
  public async saveMessage(
    sender: string,
    roomId: string,
    content: string,
    timestamp: string,
    urls?: string[]): Promise<void> {
    try {
      const data = {
        sender: new ObjectId(sender),
        content,
        timestamp,
        urls
      };

      const result = await this._collection.updateOne(
        { _id: new ObjectId(roomId) },
        { $push: { messages: data } }
      );

      console.log("Saved message: " + result?.modifiedCount);
    } catch (e) {
      console.error("Error saving message: " + e);
    }
  }

  /**
   * Delete a room.
   * @param roomId - The ID of the room to delete.
   * @param whoAsked - The ID of the user requesting the deletion.
   * @returns A Promise resolving to an HTTP status code indicating the result of the deletion:
   *          - 200 if the room is deleted successfully.
   *          - 403 if the user is not the admin of the room.
   *          - 404 if the room is not found.
   * @throws Error if there's an issue with the deletion process.
   */
  public async deleteRoom(roomId: string, whoAsked: string): Promise<number> {
    try {
      const room = await this._collection.findOne({ _id: new ObjectId(roomId) });

      if (!room) {
        return 404; // Room not found
      }


      // Check if the user requesting deletion is the admin of the room
      if (room.type == "global" || !room.admin?.equals(new ObjectId(whoAsked))) {
        return 403; // User is not the admin of the room
      }

      // Delete the room
      const result = await this._collection.deleteOne({ _id: new ObjectId(roomId) });

      // Check if the deletion was successful
      if (result?.deletedCount === 1) {
        return 200; // Room deleted successfully
      }

      throw new Error("Failed to delete the room");
    } catch (err: any) {
      const errStacked = new Error(`Error in deleteRoom: ${err.message}`);
      throw errStacked;
    }
  }

  /**
 * Remove a participant from a room.
 * @param participantId - The ID of the participant to remove.
 * @param roomId - The ID of the room.
 * @returns A Promise resolving to the count of modified documents.
 */
  public async removeParticipant(participantId: string, roomId: string): Promise<number | undefined> {
    try {
      const result = await this._collection.updateOne(
        {
          _id: new ObjectId(roomId),
          participants: { $elemMatch: { $eq: new ObjectId(participantId) } }
        },
        {
          $pull: {
            readCursors: { _id: new ObjectId(participantId) },
            participants: new ObjectId(participantId)
          }
        }
      );

      return result?.modifiedCount;
    } catch (err: any) {
      const errStacked = new Error(`Error in removeParticipant: ${err.message}`);
      throw errStacked;
    }
  }

  /**
 * Update the read cursor for a user in a room.
 * @param roomId - The ID of the room.
 * @param userId - The ID of the user whose read cursor will be updated.
 * @param lastReadTimeStamp - The new last read timestamp for the user.
 * @returns A Promise resolving to the count of modified documents (1 if successful, 0 otherwise).
 */
  public async updateReadCursor(roomId: string, userId: string, lastReadTimeStamp: Date): Promise<number> {
    try {
      const result = await this._collection.updateOne(
        {
          _id: new ObjectId(roomId),
          "readCursors._id": new ObjectId(userId)
        },
        {
          $set: { "readCursors.$.lastReadTimeStamp": lastReadTimeStamp }
        }
      );

      return result?.modifiedCount || 0;
    } catch (err: any) {
      const errStacked = new Error(`Error in updateReadCursor: ${err.message}`);
      throw errStacked;
    }
  }

}
