import type { Request, Response } from 'express';
import { runAsync, allAsync } from '../db/database.js';

export const recordSignal = async (req: Request, res: Response) => {
  try {
    const { observatoryId, stationId, frequency, amplitude, quality } = req.body;

    if (!observatoryId || !stationId || frequency === undefined || amplitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await runAsync(
      `INSERT INTO signals (observatory_id, station_id, frequency, amplitude, quality)
       VALUES (?, ?, ?, ?, ?)`,
      [observatoryId, stationId, frequency, amplitude, quality || 1.0]
    );

    res.json({ success: true, signalId: result.lastID });
  } catch (error) {
    console.error('Error recording signal:', error);
    res.status(500).json({ error: 'Failed to record signal' });
  }
};

export const getSignals = async (req: Request, res: Response) => {
  try {
    const { observatoryId, stationId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    let query = `SELECT * FROM signals WHERE observatory_id = ?`;
    const params: any[] = [observatoryId];

    if (stationId) {
      query += ` AND station_id = ?`;
      params.push(stationId);
    }

    query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const signals = await allAsync(query, params);
    res.json(signals);
  } catch (error) {
    console.error('Error getting signals:', error);
    res.status(500).json({ error: 'Failed to get signals' });
  }
};

export const getSignalStats = async (req: Request, res: Response) => {
  try {
    const { observatoryId } = req.params;

    const stats = await allAsync(
      `SELECT 
        station_id,
        COUNT(*) as count,
        AVG(amplitude) as avg_amplitude,
        MAX(amplitude) as max_amplitude,
        MIN(amplitude) as min_amplitude,
        MAX(timestamp) as last_update
       FROM signals 
       WHERE observatory_id = ?
       GROUP BY station_id`,
      [observatoryId]
    );

    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};