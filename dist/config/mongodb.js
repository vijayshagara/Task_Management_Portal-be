"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
exports.getMongoDb = getMongoDb;
exports.isMongoConnected = isMongoConnected;
exports.closeMongo = closeMongo;
const mongodb_1 = require("mongodb");
let client = null;
let db = null;
async function connectMongo() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn('MONGODB_URI not set — cow image upload is disabled');
        return false;
    }
    try {
        client = new mongodb_1.MongoClient(uri);
        await client.connect();
        db = client.db();
        console.log('MongoDB connected for cow image storage');
        return true;
    }
    catch (error) {
        console.error('MongoDB connection failed:', error.message);
        return false;
    }
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
