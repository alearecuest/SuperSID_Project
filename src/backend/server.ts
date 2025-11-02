import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db/database.ts';
import observatoryRoutes from './routes/observatory.routes.ts';
import stationsRoutes from './routes/stations.routes.ts';
import signalsRoutes from './routes/signals.routes.ts';
import { solarCenterService } from './services/solar-center.service.ts';

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

// ========== SOLAR CENTER API ==========

// Validar conexión SFTP
app.post('/api/solar-center/validate', async (req, res) => {
  try {
    const { monitorId } = req.body;

    if (!monitorId) {
      return res.status(400).json({ success: false, message: 'Monitor ID is required' });
    }

    const result = await solarCenterService.validateConnection(monitorId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Enviar datos diarios
app.post('/api/solar-center/send-daily', async (req, res) => {
  try {
    const { stationId, stationCallSign, monitorId, date, contact, latitude, longitude, altitude } = req.body;

    if (!stationId || !stationCallSign || !monitorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'stationId, stationCallSign, monitorId, and date are required',
      });
    }

    solarCenterService.setConfig({
      monitorId,
      siteName: 'SuperSID_Observatory',
      contact: contact || 'unknown@example.com',
      latitude: latitude || 0,
      longitude: longitude || 0,
      altitude: altitude || 0,
      utcOffset: '+00:00',
    });

    const result = await solarCenterService.sendDailyData(stationId, stationCallSign, monitorId, date);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener historial de uploads
app.get('/api/solar-center/history', async (req, res) => {
  try {
    const history = await solarCenterService.getUploadHistory();
    res.json(history);
  } catch (error: any) {
    console.error('Error fetching upload history:', error);
    res.status(500).json([]);
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📊 API Documentation:');
  console.log('   POST /api/observatory/setup - Setup observatory');
  console.log('   GET /api/observatory/:id - Get observatory');
  console.log('   POST /api/stations/subscribe - Subscribe to station');
  console.log('   GET /api/signals/:observatoryId/:stationId - Get signals');
  console.log('');
  console.log('☀️  Solar Center API:');
  console.log('   POST /api/solar-center/validate - Validate SFTP connection');
  console.log('   POST /api/solar-center/send-daily - Send daily data');
  console.log('   GET /api/solar-center/history - Get upload history');
  console.log('');
});