import { Db, ObjectId } from 'mongodb';
import globalChatModel from './globalChatModel.json';

const collectionNames = ['users', 'rooms', 'media'];

const createCollection = async (db: Db, collectionName: string) => {
  try {
    const collection = await db.createCollection(collectionName);
    console.log('Collection created successfully:', collection.collectionName);

    if (collectionName === 'rooms') {
      const insertedData = await collection.insertOne(globalChatModel);
      globalThis.globalChatId = insertedData.insertedId;
      console.log('Created global chat room successfully');
    }
  } catch (err) {
    console.error('Failed to create collection:', collectionName, err);
  }
};

const findOrCreateGlobalChatRoom = async (db: Db, collectionName: string) => {
  try {
    const data = await db.collection(collectionName).find({ type: 'global' }).toArray();

    if (data.length > 0) {
      globalThis.globalChatId = data[0]._id;
    } else {
      const insertedData = await db.collection(collectionName).insertOne(globalChatModel);
      globalThis.globalChatId = insertedData.insertedId;
      console.log('Created global chat room successfully');
    }
  } catch (err) {
    console.error('Failed to fetch data from collection:', collectionName, err);
  }
};

const updateGlobalRoomUsersList = async (db: Db, collectionName: string) => {
  try {
    if (collectionName === 'rooms') {
      // Retrieve all user IDs from the "users" collection
      const usersCollection = db.collection('users');
      const users = await usersCollection.find({}, { projection: { _id: 1 } }).toArray();
      const userIds = users.map(user => user._id.toString());

      // Update the global chat room with the array of user IDs
      await db.collection(collectionName).updateOne({ type: 'global' }, { $set: { participants: userIds } });
    }
  } catch (err) {
    console.error('Failed to update global room users list:', collectionName, err);
  }
};

const setup = async (db: Db) => {
  try {
    for (const collectionName of collectionNames) {
      const collectionInfo = await db.listCollections({ name: collectionName }).next();

      if (!collectionInfo) {
        await createCollection(db, collectionName);
      } else if (collectionName === 'rooms') {
        await findOrCreateGlobalChatRoom(db, collectionName);
        await updateGlobalRoomUsersList(db, collectionName);
      }
    }
  } catch (err) {
    console.error('Failed to check collection:', err);
  }
};

export { setup };
