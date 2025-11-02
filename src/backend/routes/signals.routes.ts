import express from 'express';
import { recordSignal, getSignals, getSignalStats } from '../controllers/signals.controller.ts';

const router = express.Router();

router.post('/record', recordSignal);
router.get('/:observatoryId/:stationId', getSignals);
router.get('/:observatoryId/stats', getSignalStats);

export default router;