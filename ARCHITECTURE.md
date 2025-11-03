# 🏗️ SuperSID Pro Analytics - System Architecture

**System design, components, and data flow documentation**

**Last Updated**: 2025-11-03 21:18:31 UTC
**Version**: 1.0.0

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture Layers](#architecture-layers)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Database Layer](#database-layer)
- [TypeScript Configuration](#typescript-configuration)
- [Data Flow](#data-flow)
- [Deployment Architecture](#deployment-architecture)
- [Technology Stack](#technology-stack)

---

## 🌟 Overview

SuperSID Pro Analytics follows a **3-tier architecture**:

```
┌─────────────────────────────────────────────┐
│         Frontend (React + Webpack)          │
│  - Interactive dashboards                   │
│  - Real-time visualizations                 │
│  - User interactions                        │
└──────────────────┬──────────────────────────┘
                   │ HTTP/API calls
┌──────────────────▼──────────────────────────┐
│       Backend (Express + Node.js)           │
│  - REST API endpoints                       │
│  - Business logic                           │
│  - Service layer                            │
│  - External API integration                 │
└──────────────────┬──────────────────────────┘
                   │ SQL queries
┌──────────────────▼──────────────────────────┐
│     Database Layer (SQLite3)                │
│  - Data persistence                         │
│  - Schema management                        │
│  - Query execution                          │
└─────────────────────────────────────────────┘
```

---

## 🏛️ Architecture Layers

### Layer 1: Presentation Layer (Frontend)
- **Technology**: React 18, TypeScript
- **Build Tool**: Webpack 5
- **Styling**: CSS modules
- **Charts**: Recharts
- **HTTP Client**: Fetch API / Axios

### Layer 2: Application Layer (Backend)
- **Technology**: Express.js, Node.js
- **Runtime**: ES2020 modules
- **API Style**: RESTful
- **Validation**: Manual/Middleware

### Layer 3: Data Layer (Database)
- **Technology**: SQLite3
- **Persistence**: File-based (`./data/supersid.db`)
- **Initialization**: Automatic on startup

---

## 🖥️ Backend Architecture

### Directory Structure

```
src/backend/
├── server.ts                          # Express app entry point
├── database/
│   ├── index.ts                       # Database connection & setup
│   └── db.ts                          # Table initialization
├── controllers/
│   ├── observatory.controller.ts      # Observatory endpoints logic
│   ├── signals.controller.ts          # Signal data endpoints logic
│   └── stations.controller.ts         # Station endpoints logic
├── services/
│   ├── space-weather.service.ts       # Solar activity data
│   ├── solar-center.service.ts        # Stanford SFTP uploads
│   ├── supersid.service.ts            # VLF signal processing
│   └── correlation.service.ts         # Correlation analysis
├── routes/
│   ├── observatory.routes.ts          # Observatory endpoints
│   ├── signals.routes.ts              # Signal endpoints
│   └── stations.routes.ts             # Station endpoints
└── __tests__/
    └── services/                      # Service unit tests
```

### Backend Initialization Flow

```typescript
// src/backend/server.ts
1. Import database and initialize connection
2. Create Express app instance
3. Configure middleware (JSON parser, CORS, static files)
4. Mount routes:
   - /api/observatories
   - /api/stations
   - /api/signals
5. Start listening on PORT 3001
6. Database tables auto-created on first run
```

### Service Layer

Each service handles a specific business domain:

#### SpaceWeatherService
- Fetches solar activity from external APIs
- Caches data locally
- Provides forecast data

#### SolarCenterService
- Generates SID files (CSV format)
- Uploads to Stanford SFTP server
- Tracks upload status

#### SuperSIDService
- Processes raw VLF signals
- Calculates signal statistics
- Filters noise

#### CorrelationService
- Analyzes solar-VLF correlation
- Calculates correlation coefficients
- Generates reports

---

## ⚛️ Frontend Architecture

### Directory Structure

```
src/renderer/
├── index.tsx                          # React DOM render
├── App.tsx                            # Root component
├── pages/
│   ├── Dashboard.tsx                  # Main dashboard
│   ├── SpaceWeather.tsx               # Solar activity view
│   ├── VLFSignals.tsx                 # Signal detection view
│   ├── Correlation.tsx                # Correlation analysis
│   └── Analysis.tsx                   # Advanced analysis
├── components/
│   ├── Layout.tsx                     # Main layout wrapper
│   ├── Header.tsx                     # Top navigation
│   ├── Sidebar.tsx                    # Left sidebar navigation
│   ├── SpaceWeatherChart.tsx          # Solar chart component
│   ├── VLFSignalsChart.tsx            # Signals chart component
│   ├── CorrelationChart.tsx           # Correlation visualizations
│   └── common/
│       ├── Button.tsx                 # Reusable button
│       ├── Card.tsx                   # Reusable card container
│       └── Loading.tsx                # Loading spinner
├── services/
│   └── analysis.service.ts            # API client
├── hooks/
│   ├── useFetch.ts                    # Data fetching hook
│   └── useLocalStorage.ts             # Local storage hook
├── styles/
│   ├── layout.css                     # Layout styles
│   ├── pages.css                      # Page-specific styles
│   ├── components.css                 # Component styles
│   └── variables.css                  # CSS variables/theme
└── types/
    └── index.ts                       # TypeScript type definitions
```

### React Component Hierarchy

```
<App>
├── <Layout>
│   ├── <Header />
│   ├── <Sidebar />
│   └── <main>
│       └── <PageComponent>
│           ├── <SpaceWeatherChart />
│           ├── <VLFSignalsChart />
│           ├── <CorrelationChart />
│           └── ...
└── <ErrorBoundary />
```

### Frontend Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
analysisService.fetch() [HTTP Request]
    ↓
Backend API Endpoint
    ↓
Service Layer Processing
    ↓
Database Query
    ↓
JSON Response
    ↓
Component State Update (setState)
    ↓
Re-render with New Data
```

---

## 🗄️ Database Layer

### Database Initialization

Located in: `src/backend/database/index.ts`

```typescript
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || './data/supersid.db';
const db = new sqlite3.Database(dbPath);
db.run('PRAGMA foreign_keys = ON');

export const database = db;
```

### Table Definitions

Created in: `src/backend/database/db.ts`

#### 1. Observatories Table
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

#### 2. Stations Table
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

#### 3. Signals Table
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

#### 4. Solar Center Uploads Table
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

---

## 📘 TypeScript Configuration

### Base Config: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Used for**: Frontend (React) and shared types

### Backend Config: `tsconfig.backend.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "bundler",
    "outDir": "./dist/backend",
    "rootDir": "./src/backend",
    "baseUrl": "./src/backend",
    "declaration": true,
    "sourceMap": true,
    "strict": false,
    "noEmit": false
  },
  "include": ["src/backend/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Used for**: Backend (Express.js) compilation

### Key Differences

| Config | Purpose | Module | Target |
|--------|---------|--------|--------|
| `tsconfig.json` | Frontend/shared | ES2020 | ES2020 |
| `tsconfig.backend.json` | Backend server | ES2020 | ES2020 |

---

## 🔄 Data Flow

### Request-Response Cycle

```
FRONTEND                          BACKEND                        DATABASE
    │                                │                               │
    ├─── GET /api/signals/1 ────────→│                               │
    │                                ├─ Parse request ──────────────→│
    │                                │                               │
    │                                │                     Query database
    │                                │                               │
    │                                │ ←────── Return results ────── │
    │                                │                               │
    │ ←─ 200 + JSON response ────────┤                               │
    │                                │                               │
    ├─ Update state                  │                               │
    │                                │                               │
    ├─ Re-render UI                  │                               │
    │                                │                               │
```

### Signal Data Flow (Example)

```
Sensor Hardware (SuperSID)
        ↓
VLF Data (24 kHz signals)
        ↓
[POST /api/signals] → Backend SuperSIDService
        ↓
Signal Processing & Storage
        ↓
SQLite database (signals table)
        ↓
[GET /api/signals] → Analysis results
        ↓
Frontend SpaceWeatherChart
        ↓
User Dashboard Visualization
```

---

## 🚀 Deployment Architecture

### Docker Multi-Stage Build

**Stage 1: Backend Builder**
```dockerfile
FROM node:18-alpine AS backend-builder
COPY src/backend ./src/backend
RUN npm run build:backend
```

**Stage 2: Frontend Builder**
```dockerfile
FROM node:18-alpine AS frontend-builder
COPY src/renderer ./src/renderer
COPY public ./public
RUN npm run build:renderer
```

**Stage 3: Production Runtime**
```dockerfile
FROM node:18-alpine
COPY --from=backend-builder /build/dist/backend ./dist/backend
COPY --from=frontend-builder /build/dist/renderer ./dist/renderer
RUN npm ci --only=production
CMD ["npm", "start"]
```

### Container Architecture

```
┌─────────────────────────────────────┐
│   Docker Container (SuperSID Pro)   │
├─────────────────────────────────────┤
│                                     │
│  Port 3000: Frontend (Static)       │
│  Port 3001: Backend (REST API)      │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Nginx / Express (Static)   │    │
│  └────────────┬────────────────┘    │
│               │                     │
│  ┌────────────▼────────────────┐    │
│  │  Express API Server         │    │
│  │  - Routes                   │    │
│  │  - Controllers              │    │
│  │  - Services                 │    │
│  └────────────┬────────────────┘    │
│               │                     │
│  ┌────────────▼────────────────┐    │
│  │  SQLite3 Database           │    │
│  │  /app/data/supersid.db      │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

---

## 💾 Technology Stack

### Frontend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18+ | UI framework |
| TypeScript | 5+ | Type safety |
| Webpack | 5+ | Module bundler |
| Recharts | 2+ | Charts & graphs |
| CSS3 | - | Styling |

### Backend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4+ | Web framework |
| TypeScript | 5+ | Type safety |
| sqlite3 | 5+ | Database driver |
| Axios | 1+ | HTTP client |

### Development Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| Jest | 29+ | Testing |
| ESLint | 8+ | Linting |
| Prettier | 3+ | Code formatting |
| Docker | 20+ | Containerization |

---

## 📞 Support

For database details, see [DATABASE.md](./DATABASE.md).
For development setup, see [SETUP_DEVELOPMENT.md](./SETUP_DEVELOPMENT.md).

**Last Updated**: 2025-11-03 21:18:31 UTC
**Maintained by**: @alearecuest