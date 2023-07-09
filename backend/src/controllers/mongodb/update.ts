import { getDb } from './index';
import { Db } from 'mongodb'

export const updateDocument = async (collectionName: string, filter: object, update: object, opts: object = {}): Promise<number> => {
    try {
        const db: Db | null | undefined = getDb();

        if (!db) {
            throw new Error('Database connection not established');
        }

        const collection = db.collection(collectionName);

        const result = await collection.updateOne(filter, update, opts);

        return result.modifiedCount || 0;
    } catch (error) {
        console.error('Error updating document:', error);
        throw error;
    }
};
