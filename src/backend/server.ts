import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { database } from './database/index.js';
import observatoryRoutes from './routes/observatory.routes.js';
import stationsRoutes from './routes/stations.routes.js';
import signalsRoutes from './routes/signals.routes.js';
import simulationRoutes from './routes/simulation.routes.js';
import { solarCenterService } from './services/solar-center.service.js';
import { spaceWeatherService } from './services/space-weather.service.js';
import { superSIDService } from './services/supersid.service.js';
import { correlationService } from './services/correlation.service.js';
import { vlfMonitorService } from './services/vlf-monitor.service.js';
import { audioCaptureService } from './services/audio-capture.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// CORS middleware - Must be before routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});  

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health/status', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health/version', (_req, res) => {
  res.json({ version: '1.0.0', timestamp: new Date().toISOString() });
});

app.use('/api/observatory', observatoryRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/signals', signalsRoutes);

// Simulation endpoints (only for development/demo)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/simulation', simulationRoutes);
  console.log('⚠️  Simulation API enabled (development mode)');
}

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
    const vlfData = superSIDService.getData(observatoryId);
    res.json({ success: true, data: vlfData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch VLF data' });
  }
});

app.get('/api/analysis/vlf/:observatoryId/anomalies', (req, res) => {
  try {
    const observatoryId = parseInt(req.params.observatoryId);
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

// Dashboard consolidated data
// Dashboard consolidated data
app.get('/api/analysis/dashboard/:observatoryId', async (req, res) => {
  try {
    const observatoryId = parseInt(req.params.observatoryId);

    // Get VLF Monitor latest data
    const monitorData = vlfMonitorService.getLatestReadings(100);
    
    // Get solar activity
    const solarActivity = await spaceWeatherService.getCurrentSolarActivity();

    // Build VLF data from monitor
    const vlfData = {
      observatoryId,
      signals: monitorData.map((reading: any) => ({
        timestamp: new Date(reading.timestamp).toISOString(),
        frequency: reading.frequency,
        amplitude: reading.amplitude,
        phase: reading.phase,
        snr: reading.snr,
        quality: reading.quality,
      })),
      averageAmplitude: monitorData.length > 0
        ? monitorData.reduce((sum: number, r: any) => sum + r.amplitude, 0) / monitorData.length
        : 0,
      peakAmplitude: monitorData.length > 0
        ? Math.max(...monitorData.map((r: any) => r.amplitude))
        : 0,
      noiseLevel: monitorData.length > 0
        ? monitorData[0].noiseFloor || 0
        : 0,
      disturbanceIndex: 0,
    };

    const dashboardData = {
      timestamp: new Date().toISOString(),
      solarActivity,
      vlsData: vlfData,
      correlation: {
        timestamp: new Date().toISOString(),
        solarActivity,
        vlsSignals: vlfData,
        correlationCoefficient: 0.5,
        relationship: 'Monitoring active',
        confidence: 0.8,
        summary: `Currently monitoring ${monitorData.length} signals`,
      },
      anomalies: [],
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ========== VLF MONITORING API (REAL-TIME) ==========

app.post('/api/vlf-monitor/start', async (req, res) => {
  try {
    const { stationId } = req.body;
    
    if (!stationId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Station ID is required' 
      });
    }

    await vlfMonitorService.startMonitoring(stationId);
    
    res.json({ 
      success: true, 
      message: 'VLF monitoring started',
      status: vlfMonitorService.getStatus()
    });
  } catch (error: any) {
    console.error('Error starting VLF monitoring:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/vlf-monitor/stop', (req, res) => {
  try {
    vlfMonitorService.stopMonitoring();
    
    res.json({ 
      success: true, 
      message: 'VLF monitoring stopped',
      status: vlfMonitorService.getStatus()
    });
  } catch (error: any) {
    console.error('Error stopping VLF monitoring:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/vlf-monitor/status', (req, res) => {
  try {
    const status = vlfMonitorService.getStatus();
    res.json({ success: true, data: status });
  } catch (error: any) {
    console.error('Error getting monitor status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/vlf-monitor/latest/:count?', (req, res) => {
  try {
    const count = req.params.count ? parseInt(req.params.count) : 60;
    const data = vlfMonitorService.getLatestData(count);
    
    res.json({ 
      success: true, 
      data,
      count: data.length
    });
  } catch (error: any) {
    console.error('Error getting latest data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/vlf-monitor/historical/:stationId', async (req, res) => {
  try {
    const stationId = parseInt(req.params.stationId);
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'startTime and endTime query parameters are required'
      });
    }

    const start = new Date(startTime as string);
    const end = new Date(endTime as string);

    const data = await vlfMonitorService.getHistoricalData(stationId, start, end);

    res.json({
      success: true,
      data,
      count: data.length,
      range: { start: start.toISOString(), end: end.toISOString() }
    });
  } catch (error: any) {
    console.error('Error getting historical data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/audio-devices', async (req, res) => {
  try {
    const devices = await audioCaptureService.listAudioDevices();
    res.json({ success: true, data: devices });
  } catch (error: any) {
    console.error('Error listing audio devices:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
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
  console.log('');
  console.log('Observatory:');
  console.log('POST /api/observatory/setup');
  console.log('');
  console.log('Signals:');
  console.log('GET /api/signals/:observatoryId/:stationId');
  console.log('');
  console.log('VLF Monitoring (Real-Time):');
  console.log('POST /api/vlf-monitor/start');
  console.log('POST /api/vlf-monitor/stop');
  console.log('GET  /api/vlf-monitor/status');
  console.log('GET  /api/vlf-monitor/latest/:count?');
  console.log('GET  /api/vlf-monitor/historical/:stationId?startTime=...&endTime=...');
  console.log('GET  /api/audio-devices');
  console.log('');
  console.log('Space Weather & VLF Analysis:');
  console.log('GET  /api/analysis/space-weather');
  console.log('GET  /api/analysis/space-weather/forecast');
  console.log('GET  /api/analysis/vlf/:observatoryId');
  console.log('GET  /api/analysis/vlf/:observatoryId/anomalies');
  console.log('POST /api/analysis/correlate/:observatoryId');
  console.log('GET  /api/analysis/dashboard/:observatoryId');
  console.log('');
  console.log('Solar Center API:');
  console.log('POST /api/solar-center/validate');
  console.log('POST /api/solar-center/send-daily');
  console.log('GET  /api/solar-center/history');
  console.log('');
});