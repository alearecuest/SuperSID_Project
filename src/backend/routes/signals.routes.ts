import express from 'express';
import { 
  recordSignal, 
  getSignals, 
  getSignalStats 
} from '../controllers/signals.controller.js';

const router = express.Router();

router.post('/record', recordSignal);
router.get('/:observatoryId', getSignals);
router.get('/:observatoryId/stats', getSignalStats);

export default router;