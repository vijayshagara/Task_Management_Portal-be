import { Db, MongoClient } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MONGODB_URI not set — cow image upload is disabled');
    return false;
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log('MongoDB connected for cow image storage');
    return true;
  } catch (error: any) {
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
}

export function getMongoDb(): Db {
  if (!db) {
    throw new Error('MongoDB is not connected. Set MONGODB_URI in your .env file.');
  }
  return db;
}

export function isMongoConnected(): boolean {
  return db !== null;
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
