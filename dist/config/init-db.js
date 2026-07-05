"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDbReady = ensureDbReady;
exports.isDbReady = isDbReady;
const database_1 = __importDefault(require("./database"));
const run_migrations_1 = require("../scripts/run-migrations");
const mongodb_1 = require("./mongodb");
let ready = false;
let initPromise = null;
/**
 * Ensures DB is connected and migrations are applied.
 * Required on Vercel/serverless where server.ts may not run full boot sequence.
 */
async function ensureDbReady() {
    if (ready)
        return;
    if (!initPromise) {
        initPromise = (async () => {
            await database_1.default.authenticate();
            await (0, run_migrations_1.runMigrations)();
            await (0, mongodb_1.ensureMongoConnected)();
            ready = true;
        })().catch((err) => {
            initPromise = null;
            throw err;
        });
    }
    await initPromise;
}
function isDbReady() {
    return ready;
}
