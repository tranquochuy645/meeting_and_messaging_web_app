import { getDb } from './index';
import { Db } from 'mongodb'

export const getDocuments = async (collectionName: string, query: object): Promise<any[]> => {
    try {
      const db: Db | null | undefined = getDb();
  
      if (!db) {
        throw new Error('Database connection not established');
      }
  
      const collection = db.collection(collectionName);
  
      const documents = await collection.find(query).toArray();
  
      return documents;
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  };