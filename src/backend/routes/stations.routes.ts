import express from 'express';
import { 
  subscribeToStation, 
  unsubscribeFromStation, 
  getSubscribedStations, 
  updateSubscriptionStatus 
} from '../controllers/stations.controller.js';

const router = express.Router();

router.post('/subscribe', subscribeToStation);
router.delete('/:observatoryId/stations/:stationId', unsubscribeFromStation);
router.get('/:observatoryId', getSubscribedStations);
router.put('/:observatoryId/stations/:stationId', updateSubscriptionStatus);

export default router;