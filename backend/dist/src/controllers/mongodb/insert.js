"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertDocument = void 0;
const index_1 = require("./index");
const insertDocument = (collectionName, document, options = {}) => {
    const db = (0, index_1.getDb)();
    if (!db)
        throw new Error("DB CONNECTION ERROR");
    return new Promise((resolve, reject) => {
        db.collection(collectionName)
            .insertOne(document, options)
            .then((result) => {
            resolve(result);
        })
            .catch((error) => {
            reject(error);
        });
    });
};
exports.insertDocument = insertDocument;
