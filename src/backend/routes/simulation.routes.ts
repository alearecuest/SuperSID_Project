import express from 'express';

const router = express.Router();

/**
 * Generate synthetic VLF data for testing/demo purposes
 * POST /api/simulation/generate-vlf-data/:observatoryId
 * Body: { hours: number } (optional, default: 24)
 */
router.post('/generate-vlf-data/:observatoryId', async (req, res) => {
  try {
    const observatoryId = parseInt(req.params.observatoryId);
    const { hours = 24 } = req.body;

    if (isNaN(observatoryId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid observatory ID',
      });
    }

    // Generate synthetic VLF data
    const data = [];
    const now = Date.now();
    const intervalMs = 60000; // 1 minute intervals

    for (let i = 0; i < hours * 60; i++) {
      const timestamp = new Date(now - (hours * 60 - i) * intervalMs);

      // Simulate realistic VLF signal with noise and SID events
      const baseSignal = 70 + Math.sin(i / 60) * 10; // Day/night variation
      const noise = Math.random() * 5;
      const sidEvent = Math.random() < 0.05 ? Math.random() * 30 : 0; // 5% chance of SID

      data.push({
        timestamp: timestamp.toISOString(),
        observatoryId,
        stationId: 'NAA_24.0kHz',
        frequency: 24000,
        amplitude: baseSignal + noise + sidEvent,
        phase: Math.random() * 360,
        snr: 25 + Math.random() * 10,
      });
    }

    res.json({
      success: true,
      message: `Generated ${data.length} synthetic data points for ${hours} hours`,
      data,
      count: data.length,
      note: 'This is simulated data for testing purposes only',
    });
  } catch (error: any) {
    console.error('Error generating simulation data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Clear all simulation data
 * DELETE /api/simulation/clear/:observatoryId
 */
router.delete('/clear/:observatoryId', async (req, res) => {
  try {
    const observatoryId = parseInt(req.params.observatoryId);

    // In the future, clear simulated data from database
    res.json({
      success: true,
      message: `Cleared simulation data for observatory ${observatoryId}`,
    });
  } catch (error: any) {
    console.error('Error clearing simulation data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get simulation status
 * GET /api/simulation/status
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    enabled: true,
    message: 'Simulation endpoints are available',
    endpoints: [
      'POST /api/simulation/generate-vlf-data/:observatoryId',
      'DELETE /api/simulation/clear/:observatoryId',
      'GET /api/simulation/status',
    ],
  });
});

export default router;