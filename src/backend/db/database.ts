import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || './data/supersid.db';
const INIT_SQL_PATH = path.join(__dirname, 'init.sql');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database:', DB_PATH);
    initializeDatabase();
  }
});

export const initializeDatabase = () => {
  const sql = fs.readFileSync(INIT_SQL_PATH, 'utf-8');
  
  db.exec(sql, (err) => {
    if (err) {
      console.error('❌ Error initializing database:', err);
    } else {
      console.log('✅ Database initialized successfully');
    }
  });
};

export const runAsync = (query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const getAsync = (query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const allAsync = (query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

export default db;