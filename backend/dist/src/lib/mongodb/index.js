"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = exports.connectToDb = void 0;
const mongodb_1 = require("mongodb");
const opts = {};
const mongo_uri = process.env.MONGO_URI;
const db_name = process.env.DB_NAME;
if (!mongo_uri || !db_name) {
    throw new Error(`Invalid Mongo URI or database name`);
}
let db;
// this should be called only once before starting the application
// or when connection is failed
const connectToDb = (callback) => {
    mongodb_1.MongoClient.connect(mongo_uri, opts)
        .then((client) => {
        db = client.db(db_name);
        if (callback) {
            callback();
        }
    })
        .catch((err) => {
        console.error(err);
        if (callback) {
            callback(err);
        }
    });
};
exports.connectToDb = connectToDb;
// this should be called to get the reference to db object where ever needed
const getDb = () => {
    return db;
};
exports.getDb = getDb;
