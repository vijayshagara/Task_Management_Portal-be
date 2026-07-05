"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../config/database"));
/**
 * Runs idempotent SQL migrations against production.
 * Safe to call on every server boot (Vercel cold starts).
 */
async function runMigrations() {
    const sqlPath = path_1.default.join(__dirname, '../../migrations/20250705-farm-features.sql');
    const sql = fs_1.default.readFileSync(sqlPath, 'utf8');
    // Run as a single query batch; statements use IF NOT EXISTS
    await database_1.default.query(sql);
    console.log('✅ Database migrations applied');
}
if (require.main === module) {
    database_1.default
        .authenticate()
        .then(() => runMigrations())
        .then(() => process.exit(0))
        .catch((err) => {
        console.error('Migration failed:', err.message);
        process.exit(1);
    });
}
