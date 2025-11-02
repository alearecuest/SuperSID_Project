import express from 'express';
import {
  subscribeToStation,
  unsubscribeFromStation,
  getSubscribedStations,
  updateSubscriptionStatus
} from '../controllers/stations.controller';

const router = express.Router();

router.post('/subscribe', subscribeToStation);
router.delete('/:observatoryId/:stationId', unsubscribeFromStation);
router.get('/:observatoryId/subscriptions', getSubscribedStations);
router.put('/:observatoryId/:stationId/status', updateSubscriptionStatus);

export default router;