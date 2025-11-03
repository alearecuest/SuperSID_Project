# 🗄️ SuperSID Pro Analytics - Database Documentation

**SQLite3 database schema, operations, and management**

**Last Updated**: 2025-11-03 21:21:45 UTC
**Version**: 1.0.0

---

## 📋 Table of Contents

- [Overview](#overview)
- [Database Location](#database-location)
- [Schema](#schema)
- [Table Relationships](#table-relationships)
- [Initialization](#initialization)
- [Common Operations](#common-operations)
- [Backup & Restore](#backup--restore)
- [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

SuperSID Pro Analytics uses **SQLite3** as its persistent storage layer. SQLite is a lightweight, file-based relational database that's ideal for applications like this.

### Key Features
- ✅ Zero-configuration
- ✅ Self-contained (single file)
- ✅ No server required
- ✅ ACID transactions
- ✅ Full-text search capable
- ✅ Perfect for development and production

### Database Statistics
- **Type**: SQLite3
- **Tables**: 4 main tables
- **Relationships**: Foreign keys enabled
- **File Size**: Scales with data volume (~100MB for 1M records)

---

## 📍 Database Location

### Development
```
./data/supersid.db
```

### Environment Variable
```env
DATABASE_PATH=./data/supersid.db
```

### Docker Container
```
/app/data/supersid.db
```

### Change Location

Edit `.env`:
```env
DATABASE_PATH=/custom/path/supersid.db
```

---

## 🏛️ Schema

### Table 1: `observatories`

**Purpose**: Observatory/station master data locations

```sql
CREATE TABLE observatories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  altitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Unique identifier |
| name | TEXT | Observatory name (unique) |
| latitude | REAL | Geographic latitude |
| longitude | REAL | Geographic longitude |
| altitude | REAL | Altitude in meters |
| created_at | DATETIME | Creation timestamp |

**Example**:
```sql
INSERT INTO observatories (name, latitude, longitude, altitude)
VALUES ('Stanford Observatory', 37.4275, -122.1697, 29);
```

---

### Table 2: `stations`

**Purpose**: VLF receiving stations configuration

```sql
CREATE TABLE stations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  observatory_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  frequency REAL DEFAULT 24000,
  antenna_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(observatory_id) REFERENCES observatories(id)
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Unique identifier |
| observatory_id | INTEGER | References observatories(id) |
| name | TEXT | Station name |
| frequency | REAL | Transmission frequency (Hz) - Default: 24000 |
| antenna_type | TEXT | Type of antenna used |
| created_at | DATETIME | Creation timestamp |

**Example**:
```sql
INSERT INTO stations (observatory_id, name, frequency, antenna_type)
VALUES (1, 'VLF Receiver A', 24000, 'Long Wire');
```

---

### Table 3: `signals`

**Purpose**: Raw VLF signal data recordings

```sql
CREATE TABLE signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  station_id INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  amplitude REAL NOT NULL,
  frequency REAL,
  quality REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(station_id) REFERENCES stations(id)
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Unique identifier |
| station_id | INTEGER | References stations(id) |
| timestamp | DATETIME | Signal measurement time |
| amplitude | REAL | Signal amplitude (dBm) |
| frequency | REAL | Measured frequency (Hz) |
| quality | REAL | Signal quality (0-100) |
| created_at | DATETIME | Record creation time |

**Example**:
```sql
INSERT INTO signals (station_id, timestamp, amplitude, frequency, quality)
VALUES (1, '2025-11-03 12:00:00', 45.5, 24000.5, 85.0);
```

**Indexes** (recommended):
```sql
CREATE INDEX idx_signals_station_id ON signals(station_id);
CREATE INDEX idx_signals_timestamp ON signals(timestamp DESC);
```

---

### Table 4: `solar_center_uploads`

**Purpose**: Track Stanford Solar Center file submissions

```sql
CREATE TABLE solar_center_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  station_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(station_id) REFERENCES stations(id)
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Unique identifier |
| station_id | INTEGER | References stations(id) |
| date | TEXT | Date of upload (YYYY-MM-DD) |
| status | TEXT | 'success', 'failed', 'pending' |
| details | TEXT | Error/status details |
| created_at | DATETIME | Submission timestamp |

**Example**:
```sql
INSERT INTO solar_center_uploads (station_id, date, status, details)
VALUES (1, '2025-11-03', 'success', 'File uploaded successfully');
```

---

## 🔗 Table Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│  observatories  │
│  ┌───────────┐  │
│  │ id (PK)   │  │
│  │ name      │  │
│  │ latitude  │  │
│  │ longitude │  │
│  └───────────┘  │
└────────┬────────┘
         │ 1
         │ (1:N)
         │
┌────────▼────────┐
│   stations      │
│  ┌────────────┐ │
│  │ id (PK)    │ │
│  │ obs_id(FK) │─┼─→ observatories
│  │ name       │ │
│  │ frequency  │ │
│  └────────────┘ │
└────────┬────────┘
         │ 1
         │ (1:N)
         │
         ├─────────────────┬──────────────────┐
         │                 │                  │
    ┌────▼───────┐    ┌────▼──────────────┐  │
    │  signals   │    │ solar_center_     │  │
    │            │    │ uploads           │  │
    │ id (PK)    │    │                   │  │
    │ stn_id(FK) │─┐  │ id (PK)           │  │
    │ timestamp  │ │  │ stn_id(FK)        │──┘
    │ amplitude  │ │  │ date              │
    │ frequency  │ │  │ status            │
    │ quality    │ │  │ details           │
    └────────────┘ │  └───────────────────┘
                   │
                   └─→ stations
```

### Constraints

**Foreign Keys Enabled**:
```sql
PRAGMA foreign_keys = ON;
```

**Relationships**:
1. `observatories` → (1 to N) → `stations`
2. `stations` → (1 to N) → `signals`
3. `stations` → (1 to N) → `solar_center_uploads`

---

## 🚀 Initialization

### Automatic Initialization

**When**: First time `npm run dev:backend` is executed

**Location**: `src/backend/database/db.ts`

**Process**:
```typescript
import { database } from './index';

export async function initializeTables() {
  database.exec(`
    CREATE TABLE IF NOT EXISTS observatories (...)
    CREATE TABLE IF NOT EXISTS stations (...)
    CREATE TABLE IF NOT EXISTS signals (...)
    CREATE TABLE IF NOT EXISTS solar_center_uploads (...)
  `);
  console.log('✅ Database tables initialized');
}
```

### Manual Initialization

1. **Delete existing database**:
```bash
rm ./data/supersid.db
```

2. **Restart backend**:
```bash
npm run dev:backend
```

The database will be recreated automatically.

### Verify Initialization

```bash
sqlite3 ./data/supersid.db ".tables"
```

**Expected output**:
```
observatories  signals  solar_center_uploads  stations
```

---

## 📊 Common Operations

### Using SQLite CLI

#### Open Database

```bash
sqlite3 ./data/supersid.db
```

#### List Tables

```sql
.tables
```

#### Table Schema

```sql
.schema observatories
.schema stations
.schema signals
.schema solar_center_uploads
```

#### Enable Header & Column Output

```sql
.headers on
.mode column
```

---

### Query Examples

#### 1. Get All Observatories

```sql
SELECT * FROM observatories;
```

#### 2. Get All Stations for an Observatory

```sql
SELECT s.* 
FROM stations s
WHERE s.observatory_id = 1;
```

#### 3. Get Recent Signals (Last 24 hours)

```sql
SELECT * FROM signals
WHERE timestamp > datetime('now', '-24 hours')
ORDER BY timestamp DESC;
```

#### 4. Get Signal Statistics

```sql
SELECT 
  station_id,
  COUNT(*) as total_signals,
  AVG(amplitude) as avg_amplitude,
  MAX(amplitude) as peak_amplitude,
  MIN(amplitude) as min_amplitude,
  AVG(quality) as avg_quality
FROM signals
GROUP BY station_id;
```

#### 5. Get Upload History

```sql
SELECT 
  scu.date,
  scu.status,
  s.name as station_name,
  o.name as observatory_name
FROM solar_center_uploads scu
JOIN stations s ON scu.station_id = s.id
JOIN observatories o ON s.observatory_id = o.id
ORDER BY scu.created_at DESC
LIMIT 50;
```

#### 6. Count Records

```sql
SELECT 
  'observatories' as table_name, COUNT(*) as count FROM observatories
UNION ALL
SELECT 'stations', COUNT(*) FROM stations
UNION ALL
SELECT 'signals', COUNT(*) FROM signals
UNION ALL
SELECT 'solar_center_uploads', COUNT(*) FROM solar_center_uploads;
```

---

### Insert Data

#### 1. Add Observatory

```sql
INSERT INTO observatories (name, latitude, longitude, altitude)
VALUES ('New Observatory', 40.1234, -105.5678, 1500);
```

#### 2. Add Station

```sql
INSERT INTO stations (observatory_id, name, frequency, antenna_type)
VALUES (1, 'Station Alpha', 24000, 'Long Wire');
```

#### 3. Add Signal

```sql
INSERT INTO signals (station_id, timestamp, amplitude, frequency, quality)
VALUES (1, '2025-11-03 14:30:00', 52.3, 24000.2, 90.0);
```

---

### Update Data

```sql
UPDATE observatories 
SET name = 'Updated Name'
WHERE id = 1;
```

---

### Delete Data

⚠️ **Use with caution** - this will cascade delete!

```sql
-- Delete signals from a station
DELETE FROM signals WHERE station_id = 1;

-- Delete a station
DELETE FROM stations WHERE id = 1;

-- Delete all observatories
DELETE FROM observatories;
```

---

## 💾 Backup & Restore

### Backup Database

#### 1. Simple File Copy

```bash
cp ./data/supersid.db ./data/supersid.db.backup
```

#### 2. SQLite Dump (SQL format)

```bash
sqlite3 ./data/supersid.db ".dump" > backup.sql
```

#### 3. Timestamped Backup

```bash
cp ./data/supersid.db "./data/supersid.db.$(date +%Y%m%d_%H%M%S).backup"
```

### Restore Database

#### 1. From File Copy

```bash
cp ./data/supersid.db.backup ./data/supersid.db
```

#### 2. From SQL Dump

```bash
sqlite3 ./data/supersid.db < backup.sql
```

### Automated Backup Script

Create `scripts/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/supersid_$DATE.db"

mkdir -p $BACKUP_DIR
cp ./data/supersid.db $BACKUP_FILE

# Keep only last 10 backups
ls -t $BACKUP_DIR/supersid_*.db | tail -n +11 | xargs rm -f

echo "✅ Backup created: $BACKUP_FILE"
```

Run it:

```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

---

## 🐛 Troubleshooting

### Database Locked Error

**Error**: `database is locked`

**Solutions**:
```bash
# 1. Close any open SQLite connections
pkill sqlite3

# 2. Check for stuck processes
lsof ./data/supersid.db

# 3. Reset database
rm ./data/supersid.db
npm run dev:backend
```

### Foreign Key Constraint Failed

**Error**: `FOREIGN KEY constraint failed`

**Cause**: Trying to insert/update with invalid foreign key reference

**Solution**:
```sql
-- Check if referenced record exists
SELECT * FROM observatories WHERE id = 1;

-- Only then insert station
INSERT INTO stations (observatory_id, ...) VALUES (1, ...);
```

### Database File Corrupted

**Symptoms**: Unexpected errors, tables not appearing

**Recovery**:
```bash
# 1. Backup corrupted file
mv ./data/supersid.db ./data/supersid.db.corrupt

# 2. Let the app reinitialize
npm run dev:backend

# 3. Check recovery worked
sqlite3 ./data/supersid.db ".tables"
```

### Out of Disk Space

**Error**: `disk I/O error` or `database or disk is full`

**Solution**:
```bash
# Check disk usage
df -h

# Archive old signal data
sqlite3 ./data/supersid.db > signals_archive.sql

# Delete old records
sqlite3 ./data/supersid.db "DELETE FROM signals WHERE timestamp < datetime('now', '-1 year');"

# Vacuum database (optimize file size)
sqlite3 ./data/supersid.db "VACUUM;"
```

### Performance Issues

**Symptoms**: Slow queries, high CPU usage

**Solutions**:
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_signals_timestamp ON signals(timestamp DESC);
CREATE INDEX idx_signals_station ON signals(station_id);

-- Analyze query performance
EXPLAIN QUERY PLAN SELECT * FROM signals WHERE timestamp > datetime('now', '-1 day');

-- Vacuum to reclaim space
VACUUM;

-- Get stats
PRAGMA database_list;
```

---

## 📈 Database Maintenance

### Regular Tasks

#### Daily
- ✅ Automated backups
- ✅ Monitor disk space

#### Weekly
- ✅ Check query performance
- ✅ Review error logs

#### Monthly
- ✅ Archive old data (>1 year)
- ✅ Vacuum database
- ✅ Full backup to external storage

#### Quarterly
- ✅ Database integrity check
- ✅ Update statistics

### Integrity Check

```bash
sqlite3 ./data/supersid.db "PRAGMA integrity_check;"
```

Expected output: `ok`

### Optimize Database

```bash
# After lots of deletes
sqlite3 ./data/supersid.db "VACUUM;"

# Update query planner statistics
sqlite3 ./data/supersid.db "ANALYZE;"
```

---

## 📚 Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQLite Command Line Tool](https://www.sqlite.org/cli.html)
- [SQL Tutorials](https://www.sqlite.org/lang.html)
- [sqlite3 npm package](https://www.npmjs.com/package/sqlite3)

---

## 📞 Support

For backend architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).
For development setup, see [SETUP_DEVELOPMENT.md](./SETUP_DEVELOPMENT.md).

**Last Updated**: 2025-11-03 21:21:45 UTC
**Maintained by**: @alearecuest