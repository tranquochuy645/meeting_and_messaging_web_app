import { MongoClient, Db, DbOptions } from 'mongodb';

let db: Db | null | undefined;
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
            if (callback) {
                callback();
            }
        })
        .catch((err) => {
            console.error(err);
            if (callback) {
                callback(err);
            }
        });
};


// this should be called to get the reference to db object where ever needed
export const getDb = (): Db | null | undefined => {
    return db;
};