import { D1Database } from '@cloudflare/workers-types';

declare global {
  var DB: D1Database | undefined;
}

export async function initializeDb(db: D1Database) {
  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS data_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      config TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'inactive',
      last_connected TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      config TEXT NOT NULL,
      user_id TEXT NOT NULL,
      html_content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS insights (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      explanation TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      report_id TEXT,
      user_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES reports(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Insert default admin user if not exists
  const adminExists = await db.prepare(
    "SELECT id FROM users WHERE username = 'admin'"
  ).first();

  if (!adminExists) {
    await db.prepare(
      "INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)"
    ).bind(
      crypto.randomUUID(),
      'admin',
      // In production, use a proper password hashing method
      'admin' // This is just for demo purposes
    ).run();
  }
}

export async function getDb(): Promise<D1Database> {
  if (process.env.NODE_ENV === 'development' && global.DB) {
    return global.DB;
  }
  
  // In production, this will be provided by Cloudflare
  throw new Error('Database not initialized');
}
