import type { Request, Response } from 'express';
import { runAsync, getAsync, allAsync } from '../db/database.js';

export const subscribeToStation = async (req: Request, res: Response) => {
  try {
    const { observatoryId, stationId, notes } = req.body;

    if (!observatoryId || !stationId) {
      return res.status(400).json({ error: 'observatoryId and stationId required' });
    }

    await runAsync(
      `INSERT OR REPLACE INTO station_subscriptions 
       (observatory_id, station_id, is_active, notes)
       VALUES (?, ?, 1, ?)`,
      [observatoryId, stationId, notes || '']
    );

    res.json({ success: true, message: `Subscribed to station ${stationId}` });
  } catch (error) {
    console.error('Error subscribing to station:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
};

export const unsubscribeFromStation = async (req: Request, res: Response) => {
  try {
    const { observatoryId, stationId } = req.params;

    await runAsync(
      `DELETE FROM station_subscriptions 
       WHERE observatory_id = ? AND station_id = ?`,
      [observatoryId, stationId]
    );

    res.json({ success: true, message: `Unsubscribed from station ${stationId}` });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
};

export const getSubscribedStations = async (req: Request, res: Response) => {
  try {
    const { observatoryId } = req.params;

    const stations = await allAsync(
      `SELECT * FROM station_subscriptions 
       WHERE observatory_id = ? AND is_active = 1
       ORDER BY subscribed_at DESC`,
      [observatoryId]
    );

    res.json(stations);
  } catch (error) {
    console.error('Error getting subscribed stations:', error);
    res.status(500).json({ error: 'Failed to get stations' });
  }
};

export const updateSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const { observatoryId, stationId } = req.params;
    const { isActive } = req.body;

    await runAsync(
      `UPDATE station_subscriptions 
       SET is_active = ? 
       WHERE observatory_id = ? AND station_id = ?`,
      [isActive ? 1 : 0, observatoryId, stationId]
    );

    res.json({ success: true, message: 'Subscription updated' });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};