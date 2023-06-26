import { MongoClient, Db } from 'mongodb';

const opts = {};
const mongo_uri = process.env.MONGO_URI;
const db_name = process.env.DB_NAME;

if (!mongo_uri || !db_name) {
  throw new Error(`Invalid Mongo URI or database name`);
}

let db: Db | null | undefined;
// this should be called only once before starting the application
// or when connection is failed

export const connectToDb = (callback?: (err?: Error) => void): void => {
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
