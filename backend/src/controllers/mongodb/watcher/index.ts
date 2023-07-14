import { getDb } from "../connection";
const createWatcher = (
    collectionName: string,
    pipeline: Array<any> = [],
    callback: (change: any) => void) => {
    const db = getDb();
    if (!db) throw new Error("DB CONNECTION ERROR");
    const changeStream = db.collection(collectionName).watch(pipeline);
    changeStream.on('change', callback);
}
export { createWatcher }