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
        id VARCHAR(36) PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NULL,
        password_hash VARCHAR(255) NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NULL,
        resume_name VARCHAR(255) DEFAULT 'Untitled Resume',
        resume_data JSON NULL,
        template_type VARCHAR(100) DEFAULT 'modern',
        personal_details JSON NULL,
        summary TEXT NULL,
        education JSON NULL,
        skills JSON NULL,
        projects JSON NULL,
        experience JSON NULL,
        extra_curricular JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Ensure columns exist just in case table already existed
    try { await client.query('ALTER TABLE resumes ADD COLUMN user_id VARCHAR(36) NULL;'); } catch (e) { }
    try { await client.query('ALTER TABLE resumes ADD COLUMN resume_name VARCHAR(255) DEFAULT $$Untitled Resume$$;'); } catch (e) { }
    try { await client.query('ALTER TABLE resumes ADD COLUMN resume_data JSON NULL;'); } catch (e) { }
    try { await client.query('ALTER TABLE resumes ADD COLUMN template_type VARCHAR(100) DEFAULT $$modern$$;'); } catch (e) { }

    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  } finally {
    if (client) client.release();
  }
};

export default pool;
