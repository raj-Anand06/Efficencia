import { Router } from 'express';
import { getEfficiencyData } from '../controller/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/efficiency', requireAuth, getEfficiencyData);

export default router;
