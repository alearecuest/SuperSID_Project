-- Observatory configuration
CREATE TABLE IF NOT EXISTS observatories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT,
  latitude REAL,
  longitude REAL,
  altitude