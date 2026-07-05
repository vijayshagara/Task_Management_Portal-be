import fs from 'fs';
import path from 'path';
import sequelize from '../config/database';

/**
 * Runs idempotent SQL migrations against production.
 * Safe to call on every server boot (Vercel cold starts).
 */
export async function runMigrations(): Promise<void> {
  const sqlPath = path.join(__dirname, '../../migrations/20250705-farm-features.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Run as a single query batch; statements use IF NOT EXISTS
  await sequelize.query(sql);
  console.log('✅ Database migrations applied');
}

if (require.main === module) {
  sequelize
    .authenticate()
    .then(() => runMigrations())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err.message);
      process.exit(1);
    });
}
