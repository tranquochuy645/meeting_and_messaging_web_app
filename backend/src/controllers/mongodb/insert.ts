import { getDb } from './index'; 

export const insertDocument = (collectionName: string, document: any, options = {}) => {
  const db = getDb();
  if (!db) throw new Error("DB CONNECTION ERROR");

  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .insertOne(document, options)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
