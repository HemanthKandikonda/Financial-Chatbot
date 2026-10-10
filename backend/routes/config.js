import { Router } from 'express';
import { getConfig, updateConfig, resetConfig } from '../controllers/configController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/', getConfig);
router.put('/', updateConfig);
router.delete('/reset', resetConfig);

export default router;
