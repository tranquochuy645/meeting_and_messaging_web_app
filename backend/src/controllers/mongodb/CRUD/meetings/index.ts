import { Collection } from "mongodb";

class MeetingsController {
    private _collection: Collection | null;
    constructor() {
        this._collection = null;
    }
    set ref(ref: Collection) {
        this._collection = ref;
    }


}
const meetings = new MeetingsController();
export { meetings }
