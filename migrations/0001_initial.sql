-- Initialize database tables for the Digital Marketing Reporting Tool

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data sources table for connections to external data
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

-- Reports table for generated marketing reports
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

-- Insights table for AI-generated insights
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

-- Insert default admin user
INSERT INTO users (id, username, password_hash, email)
VALUES ('admin-user-id', 'admin', 'admin', 'admin@example.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample data source
INSERT INTO data_sources (id, name, type, config, user_id, status)
VALUES (
  'sample-db-source',
  'Local Database',
  'database',
  '{"type":"sqlite","path":"data/marketing_reports.db"}',
  'admin-user-id',
  'active'
)
ON CONFLICT (id) DO NOTHING;
