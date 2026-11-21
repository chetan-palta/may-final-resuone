import pkg from "pg";
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Configure connection pool with settings suitable for Supabase connection pooler and Render Free tier (512MB RAM)
const pool = new Pool({
  connectionString,
  ssl: connectionString && !connectionString.includes('localhost')
    ? { rejectUnauthorized: false }
    : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection and log status safely without leaking credentials
(async () => {
  if (!connectionString) {
    console.warn("[DB] DATABASE_URL is not configured. Database operations will fail until configured.");
    return;
  }
  try {
    const client = await pool.connect();
    console.log("[DB] Connected to PostgreSQL database successfully");
    client.release();
  } catch (err: any) {
    console.error("[DB] Database initial connection check failed:", err.message || err);
  }
})();

export const initDb = async () => {
  if (!process.env.DATABASE_URL) {
    console.warn("[DB] Skipping DB initialization: DATABASE_URL not set");
    return;
  }
  let client;
  try {
    client = await pool.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        google_id TEXT UNIQUE,
        avatar TEXT,
        password_hash TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS resumes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        data JSONB,
        name TEXT DEFAULT 'Untitled Resume',
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
      CREATE INDEX IF NOT EXISTS idx_resumes_last_updated ON resumes(last_updated DESC);
    `);

    // Alter table to add is_admin column if it doesn't exist (for existing databases)
    try {
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;`);
    } catch (err: any) {
      if (!err.message.includes('already exists')) {
        console.warn('[DB] Column addition warning:', err.message);
      }
    }

    console.log('[DB] Database tables and indexes verified successfully.');
  } catch (error: any) {
    console.error('[DB] Error during database initialization:', error.message || error);
  } finally {
    if (client) client.release();
  }
};

export default pool;
