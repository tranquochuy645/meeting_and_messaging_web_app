import { ObjectId } from "mongodb";
import UsersController from "../CollectionOriented/users";
import RoomsController from "../CollectionOriented/rooms";

/**
 * RoomsExtractor class for extracting room data based on user ID.
 */
export default class RoomsExtractor {
  protected _usersController: UsersController;
  protected _roomsController: RoomsController;

  /**
   * Create a new RoomsExtractor instance.
   * @param usersController - The users controller instance.
   * @param roomsController - The rooms controller instance.
   */
  constructor(usersController: UsersController, roomsController: RoomsController) {
    this._usersController = usersController;
    this._roomsController = roomsController;
  }

  /**
   * Retrieve the room IDs based on the user ID.
   * @param userId - The user ID.
   * @returns A Promise resolving to the room IDs as an ObjectId[]
   */
  private async getRoomIds(userId: string): Promise<any> {
    try {
      const result = await this._usersController.getRooms(userId);
      const roomIds = result?.rooms.map((id: string) => {
        return { _id: new ObjectId(id) };
      });
      return roomIds;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Extract room data based on the user ID.
   * @param userId - The user ID.
   * @returns A Promise resolving to the extracted room data.
   */
  private async extractRooms(userId: string): Promise<any> {
    try {
      const roomIds = await this.getRoomIds(userId);
      let data: any[] = [];
      if (roomIds.length > 0) {
        const roomsInfo = await this._roomsController.getParticipantLists({ $or: roomIds });
        data = await Promise.all(
          roomsInfo.map(async (room: any) => {
            const participantIds = room.participants;
            const participants = await this._usersController.readManyShortProfiles({
              _id: {
                $in: participantIds.map((id: string) => new ObjectId(id)),
              },
            });
            const roomWithParticipantsData = {
              _id: room._id,
              participants,
            };
            return roomWithParticipantsData;
          })
        );
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Execute the room extraction process based on the user ID.
   * @param userId - The user ID.
   * @returns A Promise resolving to the extracted room data.
   */
  public exec(userId: string): Promise<any> {
    return this.extractRooms(userId);
  }
}
