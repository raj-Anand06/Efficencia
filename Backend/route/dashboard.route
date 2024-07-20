// route/dashboard.route.js
import express from 'express';
import { saveEfficiencyData, getEfficiencyData } from '../controller/dashboard.controller.js';

const router = express.Router();

router.post('/efficiency', saveEfficiencyData);
router.get('/efficiency', getEfficiencyData);

export default router;
