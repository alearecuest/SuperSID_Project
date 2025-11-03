# SuperSID Pro Analytics - Development Setup Guide

## 📋 Prerequisites

- **Node.js**: v18 o superior
- **npm**: v9 o superior
- **Git**: para clonar el repositorio
- **SQLite3**: para base de datos local

## 📦 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd SuperSID_Project
```

### 2. Install dependencies

```bash
# Frontend + Backend dependencies
npm install

# Development dependencies
npm install --save-dev \
  ts-jest \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @types/jest \
  typescript \
  ts-node
```

### 3. Install peer dependencies

```bash
npm install recharts axios
```

## 🏗️ Project Structure

```
SuperSID_Project/
├── src/
│   ├── backend/
│   │   ├── server.ts          # Express server
│   │   ├── services/          # Business logic
│   │   │   ├── space-weather.service.ts
│   │   │   ├── supersid.service.ts
│   │   │   └── correlation.service.ts
│   │   └── routes/            # API endpoints
│   ├── renderer/
│   │   ├── pages/             # React pages
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API client
│   │   └── styles/            # CSS files
│   └── setupTests.ts
├── jest.config.js
├── tsconfig.json
└── package.json
```

## 🔧 Configuration Files

### tsconfig.json
- Main TypeScript configuration
- Supports ES2020 target
- Module resolution for both backend and renderer

### jest.config.js
- Test runner configuration
- Uses ts-jest for TypeScript support
- JSDOM environment for React components

### webpack.config.cjs
- Renderer bundling configuration
- Dev server on port 3000

## 🚀 Development Commands

### Start development server

```bash
npm run dev
```

This runs:
- Backend on http://localhost:3001
- Frontend on http://localhost:3000

### Backend only

```bash
npm run dev:backend
```

### Frontend only

```bash
npm run dev:renderer
```

### Run tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Build for production

```bash
npm run build:backend
npm run build:renderer
```

## 📡 API Endpoints

### Space Weather

- `GET /api/analysis/space-weather` - Current solar activity
- `GET /api/analysis/space-weather/forecast` - 27-day forecast

### VLF Signals

- `GET /api/analysis/vlf/:observatoryId` - VLF data
- `GET /api/analysis/vlf/:observatoryId/anomalies` - Signal anomalies

### Correlation

- `POST /api/analysis/correlate/:observatoryId` - Correlate data
- `GET /api/analysis/dashboard/:observatoryId` - Dashboard data

## 🗄️ Database

### SQLite Setup

Database file: `./data/supersid.db`

Tables created automatically:
- `observatories` - Observatory configuration
- `stations` - VLF stations
- `signals` - Raw signal data
- `solar_center_uploads` - Solar Center submissions

### Manual database reset

```bash
rm -rf ./data/supersid.db
npm run dev:backend
```

## 📝 Environment Variables

Create `.env` file in project root:

```env
NODE_ENV=development
BACKEND_PORT=3001
FRONTEND_PORT=3000
DATABASE_PATH=./data/supersid.db
API_TIMEOUT=5000
```

## 🧪 Testing

### Test Files Location

- Services: `src/renderer/services/__tests__/`
- Components: `src/renderer/components/__tests__/`

### Running Specific Tests

```bash
# Test specific file
npm test -- analysis.service.test.ts

# Test specific pattern
npm test -- --testNamePattern="getCurrentSolarActivity"

# Test with coverage for specific file
npm test -- --coverage --collectCoverageFrom="src/renderer/services/analysis.service.ts"
```

### Coverage Reports

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🐛 Troubleshooting

### Backend connection refused

- Ensure port 3001 is available
- Check if backend is running: `npm run dev:backend`

### Tests failing with module errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

### Database errors

```bash
# Reset database
rm -rf ./data/supersid.db

# Reinitialize
npm run dev:backend
```

### Port 3000 or 3001 already in use

```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:3001 | xargs kill -9  # Backend
```

## 📚 Dependencies

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI framework |
| axios | ^1.6.0 | HTTP client |
| recharts | ^2.10.0 | Chart library |
| express | ^4.18.0 | Backend framework |
| sqlite3 | ^5.1.0 | Database |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.3.0 | Type checking |
| ts-jest | ^29.1.0 | Jest + TypeScript |
| jest | ^29.7.0 | Test framework |
| @testing-library/react | ^14.0.0 | React testing |
| webpack | ^5.89.0 | Bundler |

## 🔒 Security Best Practices

- Never commit `.env` files with sensitive data
- Use environment variables for API keys
- Validate all user inputs
- Keep dependencies updated: `npm audit`

## 📖 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Jest Documentation](https://jestjs.io)
- [Express.js Guide](https://expressjs.com)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Make changes and test: `npm test`
3. Commit with clear messages: `git commit -m "feat: add feature"`
4. Push to branch: `git push origin feature/name`
5. Open a Pull Request

## 📝 Development Notes

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use camelCase for variables/functions
- Use PascalCase for React components

### Git Commits

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Maintenance
```

## 🚢 Deployment

### Production Build

```bash
npm run build:backend
npm run build:renderer
npm start
```

### Docker (Optional)

```bash
docker build -t supersid-pro .
docker run -p 3000:3000 -p 3001:3001 supersid-pro
```

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0