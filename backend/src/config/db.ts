import pkg from "pg";
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test connection and log status
(async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL database");
    client.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

export const initDb = async () => {
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS resumes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        data JSONB,
        name TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  } finally {
    if (client) client.release();
  }
};

export default pool;
