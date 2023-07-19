"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatAppDbController = void 0;
const Setup_1 = __importDefault(require("./Setup"));
const Connection_1 = __importDefault(require("./Connection"));
const users_1 = __importDefault(require("./CRUD/CollectionOriented/users"));
const rooms_1 = __importDefault(require("./CRUD/CollectionOriented/rooms"));
const meetings_1 = __importDefault(require("./CRUD/CollectionOriented/meetings"));
const roomsExtractor_1 = __importDefault(require("./CRUD/Combined/roomsExtractor"));
const Watcher_1 = __importDefault(require("./Watcher"));
/**
 * DatabaseController class for managing database setup and providing access to collections.
 */
class DatabaseController extends Setup_1.default {
    constructor() {
        super();
    }
    /**
     * Get the singleton instance of DatabaseController.
     * @returns The singleton instance of DatabaseController.
     */
    static getInstance() {
        if (!DatabaseController.instance) {
            DatabaseController.instance = new DatabaseController();
        }
        return DatabaseController.instance;
    }
    /**
     * Initialize the database connection and setup collections.
     * @param mongo_uri - The MongoDB connection URI.
     * @param db_name - The name of the database.
     * @param opts - Options for the MongoDB connection.
     */
    async init(mongo_uri, db_name, opts) {
        this.connection = new Connection_1.default(mongo_uri, db_name, opts);
        this.db = await this.connection.getDb();
        await this.setup(this.db);
        this._watcher = new Watcher_1.default(this.db, DatabaseController._collectionNames);
        this._users = new users_1.default(this.db.collection("users"));
        this._rooms = new rooms_1.default(this.db.collection("rooms"));
        this._meetings = new meetings_1.default(this.db.collection("meetings"));
        this._roomsExtractor = new roomsExtractor_1.default(this._users, this._rooms);
    }
    /**
     * Create a change watcher for a MongoDB collection.
     * @param collectionName - The name of the collection to watch.
     * @param pipeline - The aggregation pipeline for filtering changes (optional).
     * @param callback - The callback function to handle changes.
     */
    watch(collectionName, pipeline = [], callback) {
        var _a;
        (_a = this._watcher) === null || _a === void 0 ? void 0 : _a.watch(collectionName, pipeline, callback);
    }
    /**
     * Get the UsersController instance for accessing the 'users' collection.
     * @throws Error if the UsersController instance is not initialized.
     * @returns The UsersController instance.
     */
    get users() {
        if (!this._users)
            throw new Error("USERS NOT INITIALIZED");
        return this._users;
    }
    /**
     * Get the RoomsController instance for accessing the 'rooms' collection.
     * @throws Error if the RoomsController instance is not initialized.
     * @returns The RoomsController instance.
     */
    get rooms() {
        if (!this._rooms)
            throw new Error("ROOMS NOT INITIALIZED");
        return this._rooms;
    }
    /**
     * Get the MeetingsController instance for accessing the 'meetings' collection.
     * @throws Error if the MeetingsController instance is not initialized.
     * @returns The MeetingsController instance.
     */
    get meetings() {
        if (!this._meetings)
            throw new Error("MEETINGS NOT INITIALIZED");
        return this._meetings;
    }
    /**
     * Get the RoomsExtractor instance for extracting rooms data based on user ID.
     * @throws Error if the RoomsExtractor instance is not initialized.
     * @returns The RoomsExtractor instance.
     */
    get roomsExtractor() {
        if (!this._roomsExtractor)
            throw new Error("RoomsExtractor NOT INITIALIZED");
        return this._roomsExtractor;
    }
}
DatabaseController._collectionNames = ["users", "rooms", "meetings"];
const chatAppDbController = DatabaseController.getInstance();
exports.chatAppDbController = chatAppDbController;
exports.default = DatabaseController;
