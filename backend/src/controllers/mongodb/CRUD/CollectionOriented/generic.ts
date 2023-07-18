import { Collection } from "mongodb";
export class CollectionReference {
    public _collection: Collection;
    constructor(ref: Collection) {
        this._collection = ref;
    }
}