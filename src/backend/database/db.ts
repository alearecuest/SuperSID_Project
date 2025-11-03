await database.run(`
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