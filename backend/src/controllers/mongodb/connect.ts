import { MongoClient, Db, DbOptions, ObjectId } from 'mongodb';
import { setup } from './setup';
let db: Db | null | undefined;

declare global {
    var globalChatId: ObjectId;
}

// this should be called only once before starting the application
// or when connection is failed

export const connectToDb = (
    mongo_uri: string,
    db_name: string,
    opts: DbOptions,
    callback?: (err?: Error) => void
): void => {
    MongoClient.connect(mongo_uri, opts)
        .then((client) => {
            db = client.db(db_name);

            if (db) {
                callback && callback(undefined);
                console.log("Connected to database");
                setup(db);
            } else {
                callback && callback(new Error('Failed to connect to database'));
            }
        })
        .catch((err) => {
            console.error(err);
            callback && callback(err);
        });
};


// this should be called to get the reference to db object where ever needed
export const getDb = (): Db | null | undefined => {
    return db;
};