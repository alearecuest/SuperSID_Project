# 🚀 SuperSID Pro Analytics - Development Setup Guide

**Complete guide for setting up the development environment**

**Last Updated**: 2025-11-03
**Version**: 1.0.0
**Author**: Alejandro Arévalo

---

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [Project Structure](#project-structure)
- [Development Commands](#development-commands)
- [API Endpoints](#api-endpoints)
- [Database Setup](#database-setup)
- [Testing](#testing)
- [Debugging](#debugging)
- [Troubleshooting](#troubleshooting)
- [Git Workflow](#git-workflow)

---

## 💻 System Requirements

### Minimum Requirements

- **OS**: macOS 10.15+, Ubuntu 18.04+, Windows 10+
- **CPU**: 2+ cores
- **RAM**: 4GB minimum
- **Storage**: 2GB free space
- **Internet**: Required for external APIs

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| Node.js | ≥18.0.0 | https://nodejs.org |
| npm | ≥9.0.0 | Included with Node.js |
| Git | ≥2.30.0 | https://git-scm.com |
| sqlite3 (npm) | ≥3.x | npm install sqlite3 |
| Docker | ≥20.10 (optional) | https://www.docker.com |

### Verify Installation

```bash
node --version        # Should be v18.x or higher
npm --version         # Should be 9.x or higher
git --version         # Should be 2.30+
sqlite3 --version     # Should be 3.30+
```

---

## ⚙️ Installation Steps

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/SuperSID_Project.git
cd SuperSID_Project
```

### Step 2: Install Node Modules

```bash
npm install
```

**What gets installed:**

- **Frontend**: React 18, Recharts, Axios
- **Backend**: Express, SQLite3, Socket.io
- **Dev Tools**: Jest, TypeScript, Webpack, ESLint
- **Total**: ~600MB

**Installation time**: 2-5 minutes

### Step 3: Create Environment File

```bash
cp .env.example .env.development
```

**Edit `.env.development`:**

```env
NODE_ENV=development
BACKEND_PORT=3001
FRONTEND_PORT=3000
DATABASE_PATH=./data/supersid.db
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Step 4: Initialize Database

```bash
npm run dev:backend
```

Wait for message: `✅ Server running on port 3001`

Press `Ctrl+C` to stop.

The database initializes automatically.

### Step 5: Verify Setup

```bash
# Check database
sqlite3 ./data/supersid.db ".tables"

# Should output tables: observatories, signals, etc.
```

---

## 📁 Project Structure

```
SuperSID_Project/
├── src/
│   ├── backend/
│   │   ├── server.ts                 # Express server entry
│   │   ├── services/
│   │   │   ├── space-weather.service.ts
│   │   │   ├── supersid.service.ts
│   │   │   └── correlation.service.ts
│   │   └── routes/
│   │       └── api.routes.ts
│   │
│   ├── renderer/
│   │   ├── index.tsx                 # React entry point
│   │   ├── App.tsx                   # Main component
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Main dashboard
│   │   │   ├── SpaceWeather.tsx      # Solar activity
│   │   │   ├── VLFSignals.tsx        # Signal detection
│   │   │   ├── Correlation.tsx       # Correlation analysis
│   │   │   └── Analysis.tsx          # Advanced analysis
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SpaceWeatherChart.tsx
│   │   │   ├── VLFSignalsChart.tsx
│   │   │   └── CorrelationChart.tsx
│   │   ├── services/
│   │   │   └── analysis.service.ts   # API client
│   │   └── styles/
│   │       ├── layout.css
│   │       ├── pages.css
│   │       └── dashboard.css
│   │
│   ├── setupTests.ts                 # Jest setup
│   │
│   └── __tests__/                    # Test files
│
├── dist/                             # Built files (generated)
│   ├── backend/
│   └── renderer/
│
├── data/                             # Local database
│   └── supersid.db
│
├── logs/                             # Log files
│
├── public/                           # Static assets
│
├── Configuration Files
│   ├── .env.example
│   ├── .env.development
│   ├── .env.production
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.cjs
│   ├── webpack.config.cjs
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── Documentation
│   ├── README.md
│   ├── SETUP_DEVELOPMENT.md          # This file
│   ├── DEPLOYMENT_GUIDE.md
│   └── API_DOCUMENTATION.md
│
└── git files
    ├── .git/
    ├── .gitignore
    └── .github/workflows/
```

---

## 🛠️ Development Commands

### Start Development Server

```bash
# Both frontend + backend
npm run dev
```

**Output:**
```
Frontend: http://localhost:3000
Backend API: http://localhost:3001
```

### Start Individual Services

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:renderer
```

### Build for Production

```bash
# Build both
npm run build

# Backend only
npm run build:backend

# Frontend only
npm run build:renderer
```

### Run Tests

```bash
# All tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# With coverage report
npm run test:coverage

# Specific test file
npm test -- SpaceWeatherChart.test.tsx

# Specific test pattern
npm test -- --testNamePattern="renders chart"
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Check TypeScript
npm run type-check

# Format code with Prettier
npm run format
```

### Database Commands

```bash
# Open SQLite CLI
sqlite3 ./data/supersid.db

# List tables
.tables

# Describe table
.schema observatories

# Export data
.mode csv
.output data.csv
SELECT * FROM signals;
.output stdout

# Reset database
rm ./data/supersid.db
npm run dev:backend  # Reinitialize
```

---

## 📡 API Endpoints

### Testing Endpoints

Use curl or Postman:

```bash
# Current Solar Activity
curl http://localhost:3001/api/analysis/space-weather

# Solar Forecast
curl http://localhost:3001/api/analysis/space-weather/forecast

# VLF Data
curl http://localhost:3001/api/analysis/vlf/999

# Correlate Data
curl -X POST http://localhost:3001/api/analysis/correlate/999

# Dashboard Data
curl http://localhost:3001/api/analysis/dashboard/999
```

### Full API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint reference.

---

## 🗄️ Database Setup

### SQLite Database

Located at: `./data/supersid.db`

### Tables

1. **observatories**
   - Observatory/station configuration
   - Location, coordinates, parameters

2. **stations**
   - VLF receiving stations
   - Frequency, antenna specifications

3. **signals**
   - Raw VLF signal data
   - Timestamp, amplitude, frequency, quality

4. **solar_center_uploads**
   - Submission tracking for Solar Center
   - Status, timestamp, data

### Database Initialization

Runs automatically on first backend startup:

```bash
npm run dev:backend
```

### Manual Reset

```bash
# Delete database
rm ./data/supersid.db

# Reinitialize
npm run dev:backend

# Check tables created
sqlite3 ./data/supersid.db ".tables"
```

---

## 🧪 Testing

### Test Structure

```
src/
├── renderer/
│   └── __tests__/
│       ├── services/
│       │   └── analysis.service.test.ts
│       └── components/
│           ├── SpaceWeatherChart.test.tsx
│           └── VLFSignalsChart.test.tsx
│
└── setupTests.ts
```

### Writing Tests

#### Service Test Template

```typescript
import { analysisService } from '../analysis.service';

describe('AnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data', async () => {
    const mockData = { /* ... */ };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockData }),
    });

    const result = await analysisService.getCurrentSolarActivity();
    
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalled();
  });
});
```

#### Component Test Template

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Run Tests with Coverage

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## 🐛 Debugging

### Browser DevTools

1. Start dev server: `npm run dev`
2. Open browser: http://localhost:3000
3. Press `F12` to open DevTools
4. Go to Console/Sources/Network tabs

### Backend Debugging

```bash
# Run with verbose logging
DEBUG=supersid-pro:* npm run dev:backend
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend",
      "program": "${workspaceFolder}/src/backend/server.ts",
      "runtimeArgs": ["--loader", "ts-node/esm"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Common Debug Scenarios

**Frontend not loading:**
```bash
# Check webpack dev server
curl http://localhost:3000

# Check browser console
# Press F12 → Console tab
```

**Backend errors:**
```bash
# Check logs
npm run dev:backend 2>&1 | tee backend.log

# Check database
sqlite3 ./data/supersid.db ".tables"
```

**API not responding:**
```bash
# Test endpoint
curl -v http://localhost:3001/api/analysis/space-weather

# Check network in DevTools
# Press F12 → Network tab
```

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process on port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use fuser
fuser -k 3000/tcp
fuser -k 3001/tcp
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Check all types
npm run type-check

# Watch mode
npm run type-check -- --watch
```

### Tests Failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Database Locked Error

```bash
# Close any open connections
pkill sqlite3

# Or reset database
rm ./data/supersid.db
npm run dev:backend
```

### npm ERR! code EACCES

```bash
# Fix permissions
sudo chown -R $(whoami) ~/.npm

# Or use nvm (recommended)
curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

---

## 📚 Git Workflow

### Create Feature Branch

```bash
git checkout -b feature/amazing-feature
```

### Commit Changes

```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat: add amazing feature"

# Push to remote
git push origin feature/amazing-feature
```

### Commit Message Format

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add or update tests
chore: Update dependencies
ci: CI/CD changes
```

### Create Pull Request

1. Go to GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in description
5. Request reviewers

### Before Merging

```bash
# Run all checks
npm test
npm run type-check
npm run lint
npm run format
npm run build

# All should pass ✅
```

---

## 📖 Quick Reference

### Most Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm test` | Run tests |
| `npm run build` | Build for production |
| `npm run type-check` | Check TypeScript |
| `npm run lint` | Run linter |
| `npm run format` | Format code |

### File Locations

| File | Purpose |
|------|---------|
| `src/backend/server.ts` | Backend entry |
| `src/renderer/index.tsx` | Frontend entry |
| `.env.development` | Dev config |
| `./data/supersid.db` | Local database |
| `./logs/` | Application logs |

### API Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3001/api` |
| Production | `https://api.supersid-pro.com/api` |

---

## 📞 Getting Help

1. Check [README.md](./README.md) for overview
2. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment
3. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoints
4. Search GitHub issues
5. Contact: support@supersid-pro.com

---

## 🎉 You're Ready!

```bash
npm run dev
```

Then open: http://localhost:3000

**Happy coding!** 🚀