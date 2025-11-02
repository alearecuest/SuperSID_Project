-- TABLA: Observatorios
CREATE TABLE IF NOT EXISTS observatories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  institution TEXT,
  location TEXT,
  latitude REAL,
  longitude REAL,
  altitude INTEGER,
  timezone TEXT,
  solar_center_api_key TEXT,
  status TEXT DEFAULT 'pending',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- TABLA: Estaciones VLF (Subscripciones)
CREATE TABLE IF NOT EXISTS station_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  observatory_id INTEGER NOT NULL,
  station_id TEXT NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  notes TEXT,
  FOREIGN KEY (observatory_id) REFERENCES observatories(id),
  UNIQUE(observatory_id, station_id)
);

-- TABLA: Datos de Señales
CREATE TABLE IF NOT EXISTS signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  observatory_id INTEGER NOT NULL,
  station_id TEXT NOT NULL,
  frequency REAL,
  amplitude REAL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  quality REAL,
  FOREIGN KEY (observatory_id) REFERENCES observatories(id)
);

-- TABLA: Eventos SID (Sudden Ionospheric Disturbance)
CREATE TABLE IF NOT EXISTS sid_events (
  id TEXT PRIMARY KEY,
  observatory_id INTEGER NOT NULL,
  station_id TEXT NOT NULL,
  frequency REAL,
  magnitude REAL,
  duration INTEGER,
  event_type TEXT,
  confidence REAL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (observatory_id) REFERENCES observatories(id)
);

-- TABLA: Configuración del Observatorio
CREATE TABLE IF NOT EXISTS observatory_config (
  observatory_id INTEGER PRIMARY KEY,
  sampling_rate INTEGER DEFAULT 100,
  recording_duration INTEGER DEFAULT 3600,
  calibration_factor REAL DEFAULT 1.0,
  noise_threshold REAL DEFAULT 5.0,
  auto_upload BOOLEAN DEFAULT 1,
  upload_interval INTEGER DEFAULT 300,
  FOREIGN KEY (observatory_id) REFERENCES observatories(id)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_signals_observatory ON signals(observatory_id);
CREATE INDEX IF NOT EXISTS idx_signals_station ON signals(station_id);
CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp);
CREATE INDEX IF NOT EXISTS idx_subscriptions_observatory ON station_subscriptions(observatory_id);
CREATE INDEX IF NOT EXISTS idx_sid_events_observatory ON sid_events(observatory_id);