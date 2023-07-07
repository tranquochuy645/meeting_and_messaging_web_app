import { Db } from 'mongodb';
import globalChatModel from './globalChatModel.json';

const collectionNames = ['users', 'rooms', 'media'];

const setup = (db: Db) => {
    // Loop over the collection names
    collectionNames.forEach((collectionName) => {
        // Check if the collection exists
        db.listCollections({ name: collectionName })
            .next()
            .then((collectionInfo) => {
                // if collectionInfo exists, the collection exists
                if (!collectionInfo) {
                    // Create the collection
                    db.createCollection(collectionName)
                        .then(
                            (collection) => {
                                console.log('Collection created successfully:', collection.collectionName);
                                if (collectionName === "rooms") {
                                    collection.insertOne(globalChatModel)
                                        .then((insertedData) => {
                                            globalThis.globalChatId = insertedData.insertedId; // Access insertedId
                                            console.log("created global chat room successfully")
                                        })
                                        .catch((err) => {
                                            console.error('Failed to insert data into collection:', collectionName, err);
                                        });
                                }
                            }
                        )
                        .catch((err) => {
                            console.error('Failed to create collection:', collectionName, err);
                        });
                } else if (collectionName === "rooms") {
                    db.collection(collectionName)
                        .find(
                            { type: "global" }
                        )
                        .toArray()
                        .then((data) => {
                            if (data.length > 0) {
                                globalThis.globalChatId = data[0]._id; // Access _id on data[0]
                            } else {
                                db.collection(collectionName).insertOne(globalChatModel)
                                    .then((insertedData) => {
                                        globalThis.globalChatId = insertedData.insertedId; // Access insertedId
                                        console.log("created global chat room successfully")
                                    })
                                    .catch((err) => {
                                        console.error('Failed to insert data into collection:', collectionName, err);
                                    });
                            }
                        })
                        .catch((err) => {
                            console.error('Failed to fetch data from collection:', collectionName, err);
                        });
                }
            })
            .catch((err) => {
                console.error('Failed to check collection:', collectionName, err);
            });
    });
};

export { setup };
