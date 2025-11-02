import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db/database';
import observatoryRoutes from './routes/observatory.routes';
import stationsRoutes from './routes/stations.routes';
import signalsRoutes from './routes/signals.routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/observatory', observatoryRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/signals', signalsRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation:`);
  console.log(`   POST /api/observatory/setup - Setup observatory`);
  console.log(`   GET /api/observatory/:id - Get observatory`);
  console.log(`   POST /api/stations/subscribe - Subscribe to station`);
  console.log(`   GET /api/signals/:observatoryId/:stationId - Get signals`);
});