import { database } from './index';

export async function initializeTables() {
  try {
    // Create observatories table
    database.exec(`
      CREATE TABLE IF NOT EXISTS observatories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create stations table
    database.exec(`
      CREATE TABLE IF NOT EXISTS stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        observatory_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        frequency REAL DEFAULT 24000,
        antenna_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(observatory_id) REFERENCES observatories(id)
      )
    `);

    // Create signals table
    database.exec(`
      CREATE TABLE IF NOT EXISTS signals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        amplitude REAL NOT NULL,
        frequency REAL,
        quality REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(station_id) REFERENCES stations(id)
      )
    `);

    // Create solar_center_uploads table
    database.exec(`
      CREATE TABLE IF NOT EXISTS solar_center_uploads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(station_id) REFERENCES stations(id)
      )
    `);

        // Create VLF raw samples table
        database.exec(`
        CREATE TABLE IF NOT EXISTS vlf_raw_samples (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          station_id INTEGER NOT NULL,
          timestamp DATETIME NOT NULL,
          sample_rate INTEGER NOT NULL,
          buffer_size INTEGER NOT NULL,
          left_channel BLOB,
          right_channel BLOB,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(station_id) REFERENCES stations(id)
        )
      `);
  
      // Create VLF processed signals table
      database.exec(`
        CREATE TABLE IF NOT EXISTS vlf_processed_signals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          station_id INTEGER NOT NULL,
          timestamp DATETIME NOT NULL,
          frequency REAL NOT NULL,
          amplitude REAL NOT NULL,
          phase REAL NOT NULL,
          snr REAL NOT NULL,
          quality REAL NOT NULL,
          raw_amplitude REAL NOT NULL,
          noise_floor REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(station_id) REFERENCES stations(id)
        )
      `);
  
      // Create indices for faster queries
      database.exec(`
        CREATE INDEX IF NOT EXISTS idx_vlf_processed_timestamp 
        ON vlf_processed_signals(timestamp DESC);
      `);
  
      database.exec(`
        CREATE INDEX IF NOT EXISTS idx_vlf_processed_station 
        ON vlf_processed_signals(station_id, timestamp DESC);
      `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export { database };