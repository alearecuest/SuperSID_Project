import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/supersid.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        console.error('Error enabling foreign keys:', err);
      } else {
        console.log('Foreign keys enabled');
      }
    });
    
    initializeTables();
  }
});

function initializeTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS observatories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      altitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      observatory_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      frequency REAL DEFAULT 24000,
      antenna_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(observatory_id) REFERENCES observatories(id)
    );

    CREATE TABLE IF NOT EXISTS signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      amplitude REAL NOT NULL,
      frequency REAL,
      quality REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(station_id) REFERENCES stations(id)
    );

    CREATE TABLE IF NOT EXISTS solar_center_uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(station_id) REFERENCES stations(id)
    );
  `, (err) => {
    if (err) {
      console.error('Error creating tables:', err);
    } else {
      console.log('Database tables initialized');
    }
  });
}

export const database = db;
export default db;