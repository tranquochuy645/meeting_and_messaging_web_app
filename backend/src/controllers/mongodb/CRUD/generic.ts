import { Collection } from "mongodb";
export class CollectionReference {
    protected _collection: Collection;
    constructor(ref: Collection) {
        this._collection = ref;
    }
}