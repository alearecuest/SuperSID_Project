import type { Request, Response } from 'express';
import { runAsync, getAsync, allAsync } from '../db/database';

export const setupObservatory = async (req: Request, res: Response) => {
  try {
    const { id, name, institution, location, latitude, longitude, altitude, timezone, solarCenterApiKey, description } = req.body;

    if (!id || id <= 0) {
      return res.status(400).json({ error: 'Valid observatory ID required' });
    }

    const result = await runAsync(
      `INSERT OR REPLACE INTO observatories 
       (id, name, institution, location, latitude, longitude, altitude, timezone, solar_center_api_key, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'registered', ?)`,
      [id, name, institution, location, latitude, longitude, altitude, timezone, solarCenterApiKey, description]
    );

    await runAsync(
      `INSERT OR IGNORE INTO observatory_config (observatory_id) VALUES (?)`,
      [id]
    );

    res.json({ success: true, observatoryId: id, message: 'Observatory configured successfully' });
  } catch (error) {
    console.error('Error setting up observatory:', error);
    res.status(500).json({ error: 'Failed to setup observatory' });
  }
};

export const getObservatory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const observatory = await getAsync(
      `SELECT * FROM observatories WHERE id = ?`,
      [id]
    );

    if (!observatory) {
      return res.status(404).json({ error: 'Observatory not found' });
    }

    res.json(observatory);
  } catch (error) {
    console.error('Error getting observatory:', error);
    res.status(500).json({ error: 'Failed to get observatory' });
  }
};

export const getObservatoryConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const config = await getAsync(
      `SELECT * FROM observatory_config WHERE observatory_id = ?`,
      [id]
    );

    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }

    res.json(config);
  } catch (error) {
    console.error('Error getting config:', error);
    res.status(500).json({ error: 'Failed to get config' });
  }
};

export const updateObservatoryConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { samplingRate, recordingDuration, calibrationFactor, noiseThreshold, autoUpload, uploadInterval } = req.body;

    await runAsync(
      `UPDATE observatory_config 
       SET sampling_rate = ?, recording_duration = ?, calibration_factor = ?, 
           noise_threshold = ?, auto_upload = ?, upload_interval = ?
       WHERE observatory_id = ?`,
      [samplingRate, recordingDuration, calibrationFactor, noiseThreshold, autoUpload, uploadInterval, id]
    );

    res.json({ success: true, message: 'Config updated' });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
};