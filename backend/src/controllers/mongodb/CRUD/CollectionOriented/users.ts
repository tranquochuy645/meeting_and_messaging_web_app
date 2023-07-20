import { ObjectId } from "mongodb";
import { CollectionReference } from "./generic";

/**
 * UsersController class for handling user-related operations.
 */
export default class UsersController extends CollectionReference {
  /**
   * Check if a username is available.
   * @param username - The username to check availability.
   * @returns A Promise resolving to a boolean indicating if the username is available.
   */
  public async checkAvailableUserName(username: string): Promise<boolean> {
    const result = await this._collection?.findOne({ username });
    return !result;
  }

  /**
   * Create a new user.
   * @param newUser - The user object to be created.
   * @returns A Promise resolving to the result of the insertion operation.
   */
  public createUser(newUser: any): Promise<any> {
    return this._collection?.insertOne(newUser);
  }

  /**
   * Read the full profile of a user.
   * @param id - The ID of the user.
   * @returns A Promise resolving to the user's profile object.
   */
  public readProfile(id: string): Promise<any> {
    return this._collection?.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );
  }

  /**
   * Read the short profile of a user.
   * @param id - The ID of the user.
   * @returns A Promise resolving to the user's short profile object.
   */
  public readShortProfile(id: string): Promise<any> {
    return this._collection?.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          fullname: 1,
          avatar: 1,
          isOnline: 1,
        }
      }
    );
  }

  /**
   * Read the short profiles of multiple users matching the filter.
   * @param filter - The filter criteria to find users.
   * @returns A Promise resolving to an array of user short profile objects.
   */
  public readManyShortProfiles(filter: any): Promise<any[]> {
    return this._collection?.find(
      filter,
      {
        projection: {
          fullname: 1,
          avatar: 1,
          bio: 1,
          isOnline: 1,
        }
      }
    ).toArray();
  }

  /**
   * Update a user's information.
   * @param id - The ID of the user.
   * @param data - The updated data for the user.
   * @returns A Promise resolving to the result of the update operation.
   */
  public async updateUser(id: string, data: any): Promise<any> {
    try {
      const result = await this._collection?.updateOne({ _id: new ObjectId(id) }, { $set: data });
      return result.modifiedCount
    } catch (err) {
      throw err
    }
  }

  /**
   * Delete a user.
   * @param id - The ID of the user to be deleted.
   * @returns A Promise resolving to the result of the deletion operation.
   */
  //   public deleteUser(id: string): Promise<any> {
  //     // TODO: Implement user deletion logic.
  //   }

  /**
   * Get the password of a user.
   * @param username - The username of the user.
   * @returns A Promise resolving to the user's password.
   */
  public getPassword(username: string): Promise<any> {
    return this._collection?.findOne(
      { username: username },
      { projection: { password: 1 } }
    );
  }

  /**
   * Set the online status of a user.
   * @param id - The ID of the user.
   * @param isOnline - The online status to set.
   * @returns A Promise resolving to the result of the update operation.
   */
  public setStatus(id: string, isOnline: boolean): Promise<any> {
    return this._collection?.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isOnline: isOnline, lastUpdate: new Date() } }
    );
  }

  /**
   * Get the rooms of a user.
   * @param id - The ID of the user.
   * @returns A Promise resolving to the user's rooms object. { rooms: ObjectId[] }
   */
  public getRooms(id: string): Promise<any> {
    return this._collection?.findOne(
      { _id: new ObjectId(id) },
      { projection: { _id: 0, rooms: 1 } }
    );
  }

  /**
   * Remove a room ID from the invitation list of a user.
   * @param userId - The ID of the user.
   * @param roomId - The ID of the room to remove from the invitation list.
   * @returns A Promise resolving to the count of modified documents.
   */
  public async pullFromInvitaionList(userId: string, roomId: string): Promise<number | undefined> {
    try {
      const result = await this._collection?.updateOne(
        { _id: new ObjectId(userId) },
        {
          $pull: { invitations: new ObjectId(roomId) }
        }
      );

      return result?.modifiedCount;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Add a room ID to the rooms list of a user and remove it from the invitation list.
   * @param userId - The ID of the user.
   * @param roomId - The ID of the room to join.
   * @returns A Promise resolving to the count of modified documents.
   */
  public async joinRoom(userId: string, roomId: string): Promise<number | undefined> {
    try {
      const result = await this._collection?.updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: { rooms: new ObjectId(roomId) },
          $pull: { invitations: new ObjectId(roomId) }
        }
      );

      return result?.modifiedCount;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Remove a room ID from the rooms list of a user.
   * @param userId - The ID of the user.
   * @param roomId - The ID of the room to leave.
   * @returns A Promise resolving to the result of the update operation.
   */
  public leaveRoom(userId: string, roomId: string): Promise<any> {
    return this._collection?.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { rooms: new ObjectId(roomId) } }
    );
  }

  /**
   * Search for users matching a query.
   * @param whoSearch - The ID of the user performing the search.
   * @param query - The search query.
   * @param limit - The maximum number of results to return.
   * @returns A Promise resolving to an array of matching user objects.
   */
  public search(whoSearch: string, query: string, limit: number): Promise<any[]> {
    return this._collection?.find(
      {
        fullname: new RegExp(query, "i"),
        _id: { $ne: new ObjectId(whoSearch) }
      },
      { projection: { _id: 1, fullname: 1, avatar: 1 } }
    ).limit(limit).toArray();
  }

  /**
   * Update multiple users matching a filter.
   * @param filter - The filter criteria to find users.
   * @param update - The update to be applied to the matching users.
   * @returns A Promise resolving to the count of modified documents.
   */
  public async updateMany(filter: any, update: any): Promise<number | undefined> {
    try {
      const result = await this._collection?.updateMany(filter, update);
      return result?.modifiedCount;
    } catch (e) {
      throw e;
    }
  }
}
