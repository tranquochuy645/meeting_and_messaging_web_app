
import { setup } from './Setup'
import DBConnection from './Connection'
import { DbOptions, Db } from 'mongodb';
import { initilizeCRUDControllers } from './CRUD';
let dbRef: Db;
const initilizeDatabase = async (mongo_uri: string, db_name: string, opts: DbOptions) => {
    try {
        const connection = new DBConnection(mongo_uri, db_name, opts);
        dbRef = await connection.getDb();
        initilizeCRUDControllers(dbRef)
        await setup(dbRef);
    } catch (err) {
        throw err
    }
}

export { initilizeDatabase, dbRef }
export { users, rooms, meetings } from './CRUD';
export { createWatcher } from './Watcher'