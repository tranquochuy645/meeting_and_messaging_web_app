"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = exports.connectToDb = void 0;
const mongodb_1 = require("mongodb");
let db;
// this should be called only once before starting the application
// or when connection is failed
const connectToDb = (mongo_uri, db_name, opts, callback) => {
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
