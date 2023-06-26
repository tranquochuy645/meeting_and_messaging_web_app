"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDocument = void 0;
const index_1 = require("./index");
const updateDocument = async (collectionName, filter, update) => {
    try {
        const db = (0, index_1.getDb)();
        if (!db) {
            throw new Error('Database connection not established');
        }
        const collection = db.collection(collectionName);
        const result = await collection.updateOne(filter, { $set: update });
        return result.modifiedCount || 0;
    }
    catch (error) {
        console.error('Error updating document:', error);
        throw error;
    }
};
exports.updateDocument = updateDocument;
