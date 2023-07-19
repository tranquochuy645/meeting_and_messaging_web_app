"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class DBConnection {
    constructor(mongo_uri, db_name, opts) {
        this.db = null;
        this.initPromise = null;
        this.initPromise = this.init(mongo_uri, db_name, opts);
        return this;
    }
    async init(mongo_uri, db_name, opts) {
        try {
            const client = await mongodb_1.MongoClient.connect(mongo_uri, opts);
            this.db = client.db(db_name);
            if (!this.db) {
                throw new Error("Connection failed");
            }
            console.log("Connected to database");
            return;
        }
        catch (e) {
            throw e;
        }
    }
    async getDb() {
        await this.initPromise;
        if (!this.db) {
            throw new Error('Database connection has not been established.');
        }
        return this.db;
    }
}
exports.default = DBConnection;
