import { Db, MongoClient } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MONGODB_URI not set — media upload is disabled');
    return false;
  }

  if (db) return true;

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log('MongoDB connected for media storage');
    return true;
  } catch (error: any) {
    console.error('MongoDB connection failed:', error.message);
    client = null;
    db = null;
    return false;
  }
}

/** Connect on first use (needed for Vercel serverless where server.ts may not run). */
export async function ensureMongoConnected(): Promise<boolean> {
  if (db) return true;
  return connectMongo();
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
