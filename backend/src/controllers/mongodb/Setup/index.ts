import { Db, ObjectId } from 'mongodb';
import roomSchema from '../Schema/room.json';
import userSchema from '../Schema/user.json';
import mediaSchema from '../Schema/media.json';

/**
 * DatabaseSetup class for setting up the database collections and initializing global chat room.
 */
class DatabaseSetup {
  // Define the global chat room object
  private globalChat = {
    type: "global",
    participants: [],
    messages: []
  };
  private _globalChatId: ObjectId | undefined;

  // Define the collection names and validators
  private collectionNames = ['users', 'rooms', 'media'];
  private validators = [userSchema, roomSchema, mediaSchema];

  /**
   * Create a collection with a validator in the database.
   * @param db - The MongoDB database instance.
   * @param collectionName - The name of the collection to be created.
   * @param validator - The validator object for the collection.
   */
  private async createCollection(db: Db, collectionName: string, validator: object) {
    try {
      const collection = await db.createCollection(collectionName, { validator });
      console.log('Collection created successfully:', collection.collectionName);

      if (collectionName === 'rooms') {
        const insertedData = await collection.insertOne(this.globalChat);
        this._globalChatId = insertedData.insertedId;
        console.log('Created global chat room successfully');
      }
    } catch (err) {
      console.error('Failed to create collection:', collectionName, err);
    }
  }

  /**
   * Find or create the global chat room in the database.
   * @param db - The MongoDB database instance.
   * @param collectionName - The name of the collection to search for the global chat room.
   */
  private async findOrCreateGlobalChatRoom(db: Db, collectionName: string) {
    try {
      const data = await db.collection(collectionName).find({ type: 'global' }).toArray();

      if (data.length > 0) {
        this._globalChatId = data[0]._id;
      } else {
        const insertedData = await db.collection(collectionName).insertOne(this.globalChat);
        this._globalChatId = insertedData.insertedId;
        console.log('Created global chat room successfully');
      }
    } catch (err) {
      console.error('Failed to fetch data from collection:', collectionName, err);
    }
  }

  /**
   * Set the isOnline field to false for all users in the database.
   * @param db - The MongoDB database instance.
   */
  private resetOnlineState(db: Db) {
    db.collection("users").updateMany({}, { $set: { isOnline: false } })
      .then(result => {
        console.log("Reset online state: ", result.modifiedCount);
      })
      .catch(err => {
        console.error('Failed to reset online state:', err);
      });
  }

  /**
   * Main setup function to initialize database collections and global chat room.
   * @param db - The MongoDB database instance.
   */
  protected async setup(db: Db) {
    try {
      for (const [index, collectionName] of this.collectionNames.entries()) {
        const collectionInfo = await db.listCollections({ name: collectionName }).next();

        if (!collectionInfo) {
          await this.createCollection(db, collectionName, this.validators[index]);
        } else if (collectionName === 'rooms') {
          await this.findOrCreateGlobalChatRoom(db, collectionName);
        }
      }
      await this.resetOnlineState(db);
    } catch (err) {
      console.error('Failed to check collection:', err);
    }
  }

  /**
   * Get the ID of the global chat room.
   * @throws Error if the global chat ID is undefined.
   * @returns The ID of the global chat room.
   */
  get globalChatId() {
    if (!this._globalChatId) throw new Error("Global chat ID not initialized");
    return this._globalChatId;
  }
}

export default DatabaseSetup;
