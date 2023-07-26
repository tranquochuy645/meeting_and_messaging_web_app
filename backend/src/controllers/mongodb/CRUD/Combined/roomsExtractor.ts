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
   * Extract room data based on the user ID.
   * @param userId - The user ID.
   * @returns A Promise resolving to the extracted room data.
   */
  public async exec(userId: string): Promise<any> {
    try {
      const roomIds = await this._usersController.getRoomsList(userId)
      if (!roomIds) {
        return null
      }
      let data: any[] = [];
      if (roomIds && roomIds.length > 0) {
        const roomsInfo = await this._roomsController.getRoomsInfo(roomIds);
        data = await Promise.all(
          roomsInfo.map(async (room: any) => {
            const participantIds = room.participants;
            const participants = await this._usersController.readManyShortProfiles({
              _id: {
                $in: participantIds.map((id: string) => new ObjectId(id)),
              },
            });
            const roomWithParticipantsData = {
              ...room,
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


}
