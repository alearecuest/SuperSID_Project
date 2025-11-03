import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { database } from './database/index';
import observatoryRoutes from './routes/observatory.routes';
import stationsRoutes from './routes/stations.routes';
import signalsRoutes from './routes/signals.routes';
import { solarCenterService } from './services/solar-center.service';
import { spaceWeatherService } from './services/space-weather.service';
import { superSIDService } from './services/supersid.service';
import { correlationService } from './services/correlation.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/observatory', observatoryRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/signals', signalsRoutes);

// ========== ANALYSIS API - SPACE WEATHER + VLF ==========

app.get('/api/analysis/space-weather', async (req, res) => {
  try {
    const activity = await spaceWeatherService.getCurrentSolarActivity();
    res.json({ success: true, data: activity });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch space weather data' });
  }
});

app.get('/api/analysis/space-weather/forecast', async (req, res) => {
  try {
    const forecast = await spaceWeatherService.getForecast();
    res.json({ success: true, data: forecast });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch forecast' });
  }
});

app.get('/api/analysis/vlf/:observatoryId', (req, res) => {
  try {
    const observatoryId = parseInt(req.params.observatoryId);
    const vlsData = superSIDService.getData(observatoryId);
    res.json({ success: true, data: vlsData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch VLF data' });
  }
});

app.get('/api/analysis/vlf/:observatoryId/anomalies', (req, res) => {
  try {
    const anomalies = superSIDService.detectAnomalies();
    res.json({ success: true, data: anomalies, count: anomalies.length });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to detect anomalies' });
  }
});

app.post('/api/analysis/correlate/:observatoryId', async (req, res) => {
  try {
    const observatoryId = parseInt(req.params.observatoryId);
    const solarActivity = await spaceWeatherService.getCurrentSolarActivity();
    const vlsData = superSIDService.getData(observatoryId);
    const analysis = correlationService.correlateData(solarActivity, vlsData);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to correlate data' });
  }
});

app.get('/api/analysis/dashboard/:observatoryId', async (req, res) => {
  try {
    const observatoryId = parseInt(req.params.observatoryId);
    const solarActivity = await spaceWeatherService.getCurrentSolarActivity();
    const vlsData = superSIDService.getData(observatoryId);
    const correlation = correlationService.correlateData(solarActivity, vlsData);
    const anomalies = superSIDService.detectAnomalies();
    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        solarActivity,
        vlsData,
        correlation,
        anomalies,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

// ========== SOLAR CENTER API ==========

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

app.get('/api/solar-center/history', async (req, res) => {
  try {
    const history = await solarCenterService.getUploadHistory();
    res.json(history);
  } catch (error: any) {
    console.error('Error fetching upload history:', error);
    res.status(500).json([]);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}\n`);
  console.log('API Endpoints:');
  console.log('Observatory: POST /api/observatory/setup');
  console.log('Signals: GET /api/signals/:observatoryId/:stationId');
  console.log('');
  console.log('Space Weather & VLF Analysis:');
  console.log('GET /api/analysis/space-weather');
  console.log('GET /api/analysis/space-weather/forecast');
  console.log('GET /api/analysis/vlf/:observatoryId');
  console.log('GET /api/analysis/vlf/:observatoryId/anomalies');
  console.log('POST /api/analysis/correlate/:observatoryId');
  console.log('GET /api/analysis/dashboard/:observatoryId');
  console.log('');
  console.log('Solar Center API:');
  console.log('POST /api/solar-center/validate');
  console.log('POST /api/solar-center/send-daily');
  console.log('GET /api/solar-center/history\n');
});