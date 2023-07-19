"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Watcher {
    constructor(ref, allowedCollections) {
        this._db = ref;
        this._allowedCollections = allowedCollections;
    }
    watch(collectionName, pipeline = [], callback) {
        if (!this._allowedCollections.includes(collectionName)) {
            throw new Error("Forbidden collection");
        }
        const changeStream = this._db.collection(collectionName).watch(pipeline);
        changeStream.on('change', callback);
    }
}
exports.default = Watcher;
