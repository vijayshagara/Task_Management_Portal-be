import sequelize from './database';
import { runMigrations } from '../scripts/run-migrations';

let ready = false;
let initPromise: Promise<void> | null = null;

/**
 * Ensures DB is connected and migrations are applied.
 * Required on Vercel/serverless where server.ts may not run full boot sequence.
 */
export async function ensureDbReady(): Promise<void> {
  if (ready) return;
  if (!initPromise) {
    initPromise = (async () => {
      await sequelize.authenticate();
      await runMigrations();
      ready = true;
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  await initPromise;
}

export function isDbReady(): boolean {
  return ready;
}
