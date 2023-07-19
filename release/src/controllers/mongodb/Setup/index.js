"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const room_json_1 = __importDefault(require("../Schema/room.json"));
const user_json_1 = __importDefault(require("../Schema/user.json"));
const media_json_1 = __importDefault(require("../Schema/media.json"));
/**
 * DatabaseSetup class for setting up the database collections and initializing global chat room.
 */
class DatabaseSetup {
    constructor() {
        // Define the global chat room object
        this.globalChat = {
            type: "global",
            participants: [],
            messages: []
        };
        // Define the collection names and validators
        this.collectionNames = ['users', 'rooms', 'media'];
        this.validators = [user_json_1.default, room_json_1.default, media_json_1.default];
    }
    /**
     * Create a collection with a validator in the database.
     * @param db - The MongoDB database instance.
     * @param collectionName - The name of the collection to be created.
     * @param validator - The validator object for the collection.
     */
    async createCollection(db, collectionName, validator) {
        try {
            const collection = await db.createCollection(collectionName, { validator });
            console.log('Collection created successfully:', collection.collectionName);
            if (collectionName === 'rooms') {
                const insertedData = await collection.insertOne(this.globalChat);
                this._globalChatId = insertedData.insertedId;
                console.log('Created global chat room successfully');
            }
        }
        catch (err) {
            console.error('Failed to create collection:', collectionName, err);
        }
    }
    /**
     * Find or create the global chat room in the database.
     * @param db - The MongoDB database instance.
     * @param collectionName - The name of the collection to search for the global chat room.
     */
    async findOrCreateGlobalChatRoom(db, collectionName) {
        try {
            const data = await db.collection(collectionName).find({ type: 'global' }).toArray();
            if (data.length > 0) {
                this._globalChatId = data[0]._id;
            }
            else {
                const insertedData = await db.collection(collectionName).insertOne(this.globalChat);
                this._globalChatId = insertedData.insertedId;
                console.log('Created global chat room successfully');
            }
        }
        catch (err) {
            console.error('Failed to fetch data from collection:', collectionName, err);
        }
    }
    /**
     * Set the isOnline field to false for all users in the database.
     * @param db - The MongoDB database instance.
     */
    resetOnlineState(db) {
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
    async setup(db) {
        try {
            for (const [index, collectionName] of this.collectionNames.entries()) {
                const collectionInfo = await db.listCollections({ name: collectionName }).next();
                if (!collectionInfo) {
                    await this.createCollection(db, collectionName, this.validators[index]);
                }
                else if (collectionName === 'rooms') {
                    await this.findOrCreateGlobalChatRoom(db, collectionName);
                }
            }
            await this.resetOnlineState(db);
        }
        catch (err) {
            console.error('Failed to check collection:', err);
        }
    }
    /**
     * Get the ID of the global chat room.
     * @throws Error if the global chat ID is undefined.
     * @returns The ID of the global chat room.
     */
    get globalChatId() {
        if (!this._globalChatId)
            throw new Error("Global chat ID not initialized");
        return this._globalChatId;
    }
}
exports.default = DatabaseSetup;
