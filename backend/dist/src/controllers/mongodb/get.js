"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocuments = void 0;
const index_1 = require("./index");
const getDocuments = async (collectionName, query) => {
    try {
        const db = (0, index_1.getDb)();
        if (!db) {
            throw new Error('Database connection not established');
        }
        const collection = db.collection(collectionName);
        const documents = await collection.find(query).toArray();
        return documents;
    }
    catch (error) {
        console.error('Error getting documents:', error);
        throw error;
    }
};
exports.getDocuments = getDocuments;
