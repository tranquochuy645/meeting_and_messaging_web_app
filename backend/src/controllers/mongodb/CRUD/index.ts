import { getDb } from '../index';
import { Db } from 'mongodb';

export const insertDocument = async (
  collectionName: string,
  document: any,
  options = {}
) => {
  try {
    const db: Db | undefined | null = getDb();
    if (!db) throw new Error("DB CONNECTION ERROR");

    const result = await db.collection(collectionName).insertOne(document, options);
    return result;
  } catch (error) {
    console.error("Error inserting document:", error);
    throw error;
  }
};

export const insertManyDocuments = async (
  collectionName: string,
  documents: any[],
  options = {}
) => {
  try {
    const db: Db | undefined | null = getDb();
    if (!db) throw new Error("DB CONNECTION ERROR");

    const result = await db.collection(collectionName).insertMany(documents, options);
    return result;
  } catch (error) {
    console.error("Error inserting documents:", error);
    throw error;
  }
};

export const getDocuments = async (
  collectionName: string,
  filter: object,
  opts: object = {}
): Promise<any[]> => {
  try {
    const db: Db | undefined | null = getDb();
    if (!db) throw new Error('DB CONNECTION ERROR');

    const collection = db.collection(collectionName);
    const documents = await collection.find(filter, opts).toArray();
    return documents;
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

export const updateDocument = async (
  collectionName: string,
  filter: object,
  update: object,
  opts: object = {}
): Promise<number> => {
  try {
    const db: Db | undefined | null = getDb();
    if (!db) throw new Error('DB CONNECTION ERROR');

    const collection = db.collection(collectionName);
    const result = await collection.updateOne(filter, update, opts);
    return result.modifiedCount || 0;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};
export const updateManyDocuments = async (
  collectionName: string,
  filter: object,
  update: object,
  opts: object = {}
): Promise<number> => {
  try {
    const db: Db | undefined | null = getDb();
    if (!db) throw new Error('DB CONNECTION ERROR');

    const collection = db.collection(collectionName);
    const result = await collection.updateMany(filter, update, opts);
    return result.modifiedCount || 0;
  } catch (error) {
    console.error('Error updating documents:', error);
    throw error;
  }
};


export const deleteDocument = async (
  collectionName: string,
  filter: object,
  opts: object = {}
): Promise<number> => {
  try {
    const db: Db | undefined | null = getDb();
    if (!db) throw new Error('DB CONNECTION ERROR');

    const collection = db.collection(collectionName);
    const result = await collection.deleteOne(filter, opts);
    return result.deletedCount || 0;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};
