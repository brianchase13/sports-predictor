import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Database file location
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'sports-predictor.db');

// Create database connection
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Export schema for use in queries
export * from './schema';
