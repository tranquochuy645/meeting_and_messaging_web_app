import { Db } from 'mongodb';
import roomSchema from './Schema/room.json';
import userSchema from './Schema/user.json';
import mediaSchema from './Schema/media.json';

// Define the global chat room object
const globalChat = {
  type: "global",
  participants: [],
  messages: []
};

// Define the collection names and validators
const collectionNames = ['users', 'rooms', 'media'];
const validators = [userSchema, roomSchema, mediaSchema];

// Function to create a collection with a validator
const createCollection = async (db: Db, collectionName: string, validator: object) => {
  try {
    const collection = await db.createCollection(collectionName, { validator });
    console.log('Collection created successfully:', collection.collectionName);

    if (collectionName === 'rooms') {
      const insertedData = await collection.insertOne(globalChat);
      globalThis.globalChatId = insertedData.insertedId;
      console.log('Created global chat room successfully');
    }
  } catch (err) {
    console.error('Failed to create collection:', collectionName, err);
  }
};

// Function to find or create the global chat room
const findOrCreateGlobalChatRoom = async (db: Db, collectionName: string) => {
  try {
    const data = await db.collection(collectionName).find({ type: 'global' }).toArray();

    if (data.length > 0) {
      globalThis.globalChatId = data[0]._id;
    } else {
      const insertedData = await db.collection(collectionName).insertOne(globalChat);
      globalThis.globalChatId = insertedData.insertedId;
      console.log('Created global chat room successfully');
    }
  } catch (err) {
    console.error('Failed to fetch data from collection:', collectionName, err);
  }
};

// Function to clear socket IDs and set isOnline to false for all users
const clearSocketIds = (db: Db) => {
  db.collection("users").updateMany({}, { $set: { isOnline: false, socketId: [] } })
    .then(result => {
      console.log("Cleared socket IDs:", result.modifiedCount);
    })
    .catch(err => {
      console.error('Failed to clear socket IDs:', err);
    });
};

// Main setup function
const setup = async (db: Db) => {
  try {
    for (const [index, collectionName] of collectionNames.entries()) {
      const collectionInfo = await db.listCollections({ name: collectionName }).next();

      if (!collectionInfo) {
        await createCollection(db, collectionName, validators[index]);
      } else if (collectionName === 'rooms') {
        await findOrCreateGlobalChatRoom(db, collectionName);
      }
    }
  } catch (err) {
    console.error('Failed to check collection:', err);
  }

  // Clear socket IDs and set isOnline to false for all users
  clearSocketIds(db);
};

export { setup };
