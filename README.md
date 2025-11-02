# SuperSID Pro Analytics

Advanced SID (Sudden Ionospheric Disturbance) Event Analysis Platform for Radio Signal Detection and Analysis.

## Features

- **Real-time Signal Monitoring**: Live VLF signal detection and analysis
- **SID Event Detection**: Automated detection of ionospheric disturbances
- **Data Visualization**: Interactive charts and graphs
- **Multi-Station Support**: Monitor multiple observation stations simultaneously
- **Advanced Analytics**: Statistical analysis and event correlation
- **AR Capabilities**: Augmented reality visualization (beta)
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Prerequisites

- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- **Python**: v3.8+ (for backend services)
- **Git**: For version control

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/supersid-pro.git
   cd supersid-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Initialize database**
   ```bash
   npm run db:init
   ```

## Running the Application

### Development Mode

```bash
# Start development server with hot reload
npm run dev
```

This will:
- Start Vite dev server on `http://localhost:5173`
- Launch Electron app in development mode
- Enable dev tools and hot module replacement

### Build for Production

```bash
# Build and package application
npm run build

# Build for specific platform
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

### Start Production Build

```bash
npm start
```

## 📁 Project Structure

```
supersid-pro/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts
│   │   └── preload.ts
│   └── renderer/             # React frontend
│       ├── components/       # React components
│       ├── pages/           # Page components
│       ├── hooks/           # Custom hooks
│       ├── utils/           # Utility functions
│       ├── types/           # TypeScript types
│       ├── context/         # React context
│       ├── styles/          # CSS styles
│       ├── App.tsx
│       └── index.tsx
├── public/                   # Static assets
├── dist/                     # Build output
├── .env.example             # Environment template
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config
└── vite.config.ts           # Vite config
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production build

# Database
npm run db:init         # Initialize database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed sample data

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Check TypeScript types
npm run format          # Format code with Prettier

# Testing (when implemented)
npm test                # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

## API Integration

The application communicates with a backend API:

- **Base URL**: `http://localhost:3001/api` (configurable via `.env`)
- **Timeout**: 30 seconds (configurable)
- **Error Handling**: Automatic retry logic with exponential backoff

### Available Endpoints

- `GET /api/health` - Health check
- `GET /api/stations` - List all stations
- `GET /api/signals/:stationId` - Get signals for station
- `POST /api/analysis` - Create analysis request
- `GET /api/events` - List SID events

## Data Storage

- **Database**: SQLite (configurable)
- **Location**: `./data/supersid.db`
- **Backups**: Automatic daily backups to `./data/backups/`

## Environment Variables

See `.env.example` for all available configuration options:

- `NODE_ENV` - Application environment (development/production)
- `PORT` - Server port
- `DB_PATH` - Database file location
- `STATION_ID` - Default station identifier
- `LOG_LEVEL` - Logging verbosity
- Feature flags for enabling/disabling features

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=3002
```

### Database Issues
```bash
# Reset database
rm ./data/supersid.db
npm run db:init
```

### Electron Not Starting
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run dev
```

## Logging

Logs are saved to `./logs/app.log` with configurable levels:
- `error` - Error messages only
- `warn` - Warnings and errors
- `info` - General information (default)
- `debug` - Detailed debug information

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For support and questions:
- GitHub Issues: [Report bugs](https://github.com/yourusername/supersid-pro/issues)
- Discussions: [Ask questions](https://github.com/yourusername/supersid-pro/discussions)

## Acknowledgments

- SuperSID monitoring community
- NOAA Space Weather Prediction Center
- Stanford Solar Center
- VLF research community

---

**Last Updated**: November 2025
**Version**: 1.0.0