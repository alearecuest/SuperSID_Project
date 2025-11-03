# 🛰️ SuperSID Pro Analytics

**Professional VLF Signal Detection & Space Weather Analysis Platform**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Status](https://img.shields.io/badge/status-Production%20Ready-success)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Building](#building)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🌟 Overview

SuperSID Pro Analytics is a comprehensive platform for detecting and analyzing Very Low Frequency (VLF) signals in the ionosphere using the SuperSID radiotelescopio. It combines real-time signal processing, space weather monitoring, and advanced correlation analysis to detect ionospheric disturbances caused by solar events.

### Key Capabilities

- 📡 **Real-time VLF Signal Processing** - Capture and analyze 24 kHz radio signals
- ☀️ **Space Weather Integration** - Real-time solar activity and forecasts
- 🔗 **Correlation Analysis** - Correlate solar activity with VLF disturbances
- 📊 **Interactive Dashboards** - Recharts-powered visualizations
- 🗄️ **Data Persistence** - SQLite database for historical data
- 🌐 **Web & Desktop** - Runs as web app or Electron desktop application

---

## ✨ Features

### Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| VLF Signal Detection | ✅ | Real-time 24 kHz signal monitoring |
| Space Weather API | ✅ | Live solar activity data |
| Correlation Analysis | ✅ | Solar-VLF event correlation |
| Interactive Charts | ✅ | Recharts visualization library |
| Data Export | ✅ | Export to CSV/JSON |
| Multi-Observatory | ✅ | Support multiple stations |
| Dark Mode UI | ✅ | Modern dark theme |
| Responsive Design | ✅ | Mobile-friendly interface |

### Advanced Features

| Feature | Status | Description |
|---------|--------|-------------|
| Real-time WebSocket | 🚧 | Live data streaming |
| AR Visualization | 🚧 | 3D augmented reality view |
| Machine Learning | 🚧 | Anomaly detection models |
| Email Alerts | 🚧 | Automated notifications |
| API Rate Limiting | 🚧 | Request throttling |

---

## 📦 Requirements

### System Requirements

- **OS**: macOS, Linux, Windows 10+
- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space

### Software Requirements

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | ≥18.0.0 | JavaScript runtime |
| npm | ≥9.0.0 | Package manager |
| Git | ≥2.30.0 | Version control |
| SQLite3 | ≥3.30 | Database |
| Python | ≥3.8 (optional) | Data analysis |

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/SuperSID_Project.git
cd SuperSID_Project
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Frontend (React, Recharts)
- Backend (Express, SQLite3)
- Development tools (Jest, TypeScript, Webpack)

### 3. Environment Setup

Create `.env` file in project root:

```env
# Server Configuration
NODE_ENV=development
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Database
DATABASE_PATH=./data/supersid.db

# API Configuration
API_TIMEOUT=5000
CORS_ORIGIN=http://localhost:3000

# External APIs
SPACE_WEATHER_API=https://api.spaceweatherlive.com/v1
```

### 4. Initialize Database

```bash
npm run dev:backend
```

The database initializes automatically on first run.

---

## ⚡ Quick Start

### Development Mode

Start both backend and frontend:

```bash
npm run dev
```

This launches:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Backend Only

```bash
npm run dev:backend
```

### Frontend Only

```bash
npm run dev:renderer
```

### Production Build

```bash
npm run build
npm start
```

---

## 🛠️ Development

### Project Structure

```
SuperSID_Project/
├── src/
│   ├── backend/
│   │   ├── server.ts              # Express server
│   │   ├── services/
│   │   │   ├── space-weather.service.ts
│   │   │   ├── supersid.service.ts
│   │   │   └── correlation.service.ts
│   │   └── routes/
│   │       └── api.routes.ts
│   │
│   ├── renderer/
│   │   ├── index.tsx              # React entry point
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SpaceWeather.tsx
│   │   │   ├── VLFSignals.tsx
│   │   │   ├── Correlation.tsx
│   │   │   └── Analysis.tsx
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── SpaceWeatherChart.tsx
│   │   │   └── VLFSignalsChart.tsx
│   │   ├── services/
│   │   │   └── analysis.service.ts
│   │   └── styles/
│   │       ├── layout.css
│   │       ├── pages.css
│   │       └── dashboard.css
│   │
│   └── setupTests.ts
│
├── jest.config.cjs                # Jest configuration
├── tsconfig.json                  # TypeScript config
├── webpack.config.cjs             # Webpack bundler
├── package.json
└── README.md
```

### Available Commands

```bash
# Development
npm run dev                  # Start dev server (frontend + backend)
npm run dev:backend        # Backend only
npm run dev:renderer       # Frontend only

# Building
npm run build              # Build both
npm run build:backend      # Backend only
npm run build:renderer     # Frontend only

# Testing
npm test                   # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:ci           # CI mode

# Code Quality
npm run lint              # Run ESLint
npm run type-check        # TypeScript check
npm run format            # Prettier format

# Production
npm start                 # Start production build
npm run dist              # Build Electron app
```

### Code Style

#### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Use type annotations

#### React Components
```typescript
interface ComponentProps {
  title: string;
  data: any[];
  onUpdate: (data: any) => void;
}

const MyComponent: React.FC<ComponentProps> = ({ title, data, onUpdate }) => {
  return <div>{title}</div>;
};
```

#### Naming Conventions
- Components: `PascalCase` (e.g., `SpaceWeather.tsx`)
- Variables/Functions: `camelCase` (e.g., `fetchData()`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_TIMEOUT`)
- Files: kebab-case for styles (e.g., `dashboard.css`)

---

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- analysis.service.test.ts

# Specific test pattern
npm test -- --testNamePattern="getCurrentSolarActivity"
```

### Test Coverage

Current coverage:
- Services: 100%
- Components: 80%
- Overall: 90%

Target: >85% coverage

### Writing Tests

#### Service Test Example

```typescript
describe('AnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch current solar activity', async () => {
    const mockData = { /* ... */ };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockData }),
    });

    const result = await analysisService.getCurrentSolarActivity();
    expect(result).toEqual(mockData);
  });
});
```

#### Component Test Example

```typescript
describe('SpaceWeatherChart', () => {
  it('renders chart title', () => {
    render(
      <SpaceWeatherChart
        data={mockData}
        title="Test Chart"
        type="line"
      />
    );
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });
});
```

---

## 📦 Building

### Development Build

```bash
npm run build
```

Outputs to `dist/` directory.

### Production Build

```bash
npm run build
NODE_ENV=production npm start
```

### Electron Desktop App

```bash
npm run dist
```

Creates installers in `dist/` directory:
- Windows: `.exe`
- macOS: `.dmg`
- Linux: `.AppImage`

---

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy to Heroku

```bash
heroku login
heroku create supersid-pro
git push heroku main
```

### Docker Deployment

```bash
docker build -t supersid-pro .
docker run -p 3000:3000 -p 3001:3001 supersid-pro
```

See [Dockerfile](./Dockerfile) and [docker-compose.yml](./docker-compose.yml).

---

## 📡 API Documentation

### Base URL

- Development: `http://localhost:3001/api`
- Production: `https://api.supersid-pro.com/api`

### Endpoints

#### Space Weather

##### Get Current Solar Activity
```
GET /api/analysis/space-weather
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-11-03T18:12:18Z",
    "kIndex": 3,
    "solarFlux": 150,
    "activeRegions": 5,
    "sunspots": 20,
    "xrayClass": "A",
    "magneticStorm": "none"
  }
}
```

##### Get Solar Forecast
```
GET /api/analysis/space-weather/forecast
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-11-04T00:00:00Z",
      "kIndex": 4,
      "solarFlux": 160,
      ...
    }
  ]
}
```

#### VLF Signals

##### Get VLF Data
```
GET /api/analysis/vlf/:observatoryId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "observatoryId": 999,
    "signals": [],
    "averageAmplitude": 45.5,
    "peakAmplitude": 60.2,
    "noiseLevel": 35.1,
    "disturbanceIndex": 30
  }
}
```

#### Correlation

##### Correlate Solar and VLF Data
```
POST /api/analysis/correlate/:observatoryId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "correlationCoefficient": 0.45,
    "relationship": "moderate-positive",
    "confidence": 75,
    "summary": "Moderate correlation detected"
  }
}
```

### Error Responses

```json
{
  "success": false,
  "error": "Observatory not found",
  "status": 404
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

#### Database Errors

```bash
# Reset database
rm -rf ./data/supersid.db

# Reinitialize
npm run dev:backend
```

#### Module Not Found

```bash
# Clear cache
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### Tests Failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose
```

#### TypeScript Errors

```bash
# Check types
npm run type-check

# Generate types
npm run type-check -- --emitDeclarationOnly
```

### Debugging

#### Enable Debug Logging

```env
DEBUG=supersid-pro:*
```

#### Browser DevTools

Press `F12` in development mode to open DevTools.

#### Backend Logs

Check console output from `npm run dev:backend`.

---

## 📚 Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Jest Testing](https://jestjs.io)
- [Recharts Documentation](https://recharts.org)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and test: `npm test`
3. Run linter: `npm run lint`
4. Format code: `npm run format`
5. Commit: `git commit -m "feat: add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Open Pull Request

### Commit Message Format

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing done

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Tests pass locally
- [ ] Documentation updated
```

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 👥 Authors

- **Alejandro Arévalo** - Initial work - [@alearecuest](https://github.com/alearecuest)

---

## 🙏 Acknowledgments

- SuperSID Project Community
- SpaceWeatherLive API
- NOAA Space Weather Prediction Center
- React and Node.js communities

---

## 📞 Support

For support, email support@supersid-pro.com or open an issue on GitHub.

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0
**Status**: 🟢 Production Ready