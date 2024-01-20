import { Db } from "mongodb";
export default class Watcher {
    private _db: Db;
    private _allowedCollections: Array<string>
    constructor(ref: Db, allowedCollections: Array<string>) {
        this._db = ref
        this._allowedCollections = allowedCollections
    }
    public watch(
        collectionName: string,
        pipeline: Array<any> = [],
        callback: (change: any) => void
    ) {
        if (!this._allowedCollections.includes(collectionName)) {
            throw new Error("Forbidden collection")
        }
        const changeStream = this._db.collection(collectionName).watch(pipeline);
        changeStream.on('change', callback);
    }
}