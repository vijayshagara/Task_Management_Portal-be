"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
exports.ensureMongoConnected = ensureMongoConnected;
exports.getMongoDb = getMongoDb;
exports.isMongoConnected = isMongoConnected;
exports.closeMongo = closeMongo;
const mongodb_1 = require("mongodb");
let client = null;
let db = null;
async function connectMongo() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn('MONGODB_URI not set — media upload is disabled');
        return false;
    }
    if (db)
        return true;
    try {
        client = new mongodb_1.MongoClient(uri);
        await client.connect();
        db = client.db();
        console.log('MongoDB connected for media storage');
        return true;
    }
    catch (error) {
        console.error('MongoDB connection failed:', error.message);
        client = null;
        db = null;
        return false;
    }
}
/** Connect on first use (needed for Vercel serverless where server.ts may not run). */
async function ensureMongoConnected() {
    if (db)
        return true;
    return connectMongo();
}
function getMongoDb() {
    if (!db) {
        throw new Error('MongoDB is not connected. Set MONGODB_URI in your .env file.');
    }
    return db;
}
function isMongoConnected() {
    return db !== null;
}
async function closeMongo() {
    if (client) {
        await client.close();
        client = null;
        db = null;
    }
}
