import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import bcrypt from 'bcryptjs';

const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
let dbPath = path.resolve(process.cwd(), 'data', 'app.db');

if (isServerless) {
  const tmpDir = os.tmpdir();
  const tmpDb = path.join(tmpDir, 'app.db');
  if (!fs.existsSync(tmpDb)) {
    const srcDb = path.resolve(process.cwd(), 'data', 'app.db');
    if (fs.existsSync(srcDb)) {
      try {
        fs.copyFileSync(srcDb, tmpDb);
      } catch (e) {
        console.error('Failed to copy database to /tmp:', e);
      }
    }
  }
  dbPath = tmpDb;
} else {
  const dbDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

const sqlite = new Database(dbPath);

// Enable WAL mode on local node servers, DELETE on serverless /tmp
if (!isServerless) {
  sqlite.pragma('journal_mode = WAL');
} else {
  sqlite.pragma('journal_mode = DELETE');
}
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Initialize database tables
export function initDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      normalized_property_id TEXT NOT NULL UNIQUE,
      original_property_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id TEXT NOT NULL,
      original_property_id TEXT NOT NULL,
      unit_id TEXT NOT NULL,
      unit_name TEXT,
      block_id TEXT,
      floor_id TEXT,
      unit_type TEXT,
      unit_area REAL,
      sales_unit_status TEXT,
      revenue_type TEXT,
      sale_amount REAL,
      sale_tax_amount REAL,
      total_amount REAL,
      currency_code TEXT,
      occupied INTEGER DEFAULT 0,
      reserved INTEGER DEFAULT 0,
      vacant INTEGER DEFAULT 0,
      raw_data TEXT NOT NULL,
      source_row_number INTEGER,
      import_batch_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_units_property_id ON units(property_id);
    CREATE INDEX IF NOT EXISTS idx_units_unit_id ON units(unit_id);
    CREATE INDEX IF NOT EXISTS idx_units_block_id ON units(block_id);
    CREATE INDEX IF NOT EXISTS idx_units_floor_id ON units(floor_id);
    CREATE INDEX IF NOT EXISTS idx_units_sales_status ON units(sales_unit_status);
    CREATE INDEX IF NOT EXISTS idx_units_revenue_type ON units(revenue_type);
    CREATE INDEX IF NOT EXISTS idx_units_currency ON units(currency_code);
    CREATE INDEX IF NOT EXISTS idx_units_batch ON units(import_batch_id);
    CREATE INDEX IF NOT EXISTS idx_units_prop_unit ON units(property_id, unit_id);

    CREATE TABLE IF NOT EXISTS import_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      import_strategy TEXT NOT NULL,
      total_rows INTEGER NOT NULL DEFAULT 0,
      imported_rows INTEGER NOT NULL DEFAULT 0,
      updated_rows INTEGER NOT NULL DEFAULT 0,
      skipped_rows INTEGER NOT NULL DEFAULT 0,
      failed_rows INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'completed',
      imported_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS import_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      import_batch_id INTEGER NOT NULL,
      unit_id TEXT,
      field_name TEXT,
      issue_type TEXT NOT NULL,
      message TEXT NOT NULL,
      original_value TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_issues_batch ON import_issues(import_batch_id);

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    );
  `);

  // Ensure default admin user exists
  const checkUser = sqlite.prepare('SELECT id FROM users WHERE email = ?').get('admin@property.com');
  if (!checkUser) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    sqlite.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
      'System Administrator',
      'admin@property.com',
      passwordHash,
      'admin'
    );
  }
}

// Run table creation on import
initDatabase();

