import express from 'express';
import { 
  setupObservatory, 
  getObservatory, 
  getObservatoryConfig, 
  updateObservatoryConfig 
} from '../controllers/observatory.controller.ts';

const router = express.Router();

router.post('/setup', setupObservatory);
router.get('/:id', getObservatory);
router.get('/:id/config', getObservatoryConfig);
router.put('/:id/config', updateObservatoryConfig);

export default router;