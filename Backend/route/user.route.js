import { Router } from 'express';
import {
  signup,
  login,
  getCurrentUser,
  getStats,
  solveQuestion,
  syncQuestions
} from '../controller/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/login',  login);
router.get('/me', requireAuth, getCurrentUser);

router.get('/stats',             requireAuth, getStats);
router.post('/solve-question',   requireAuth, solveQuestion);
router.post('/sync-questions',   requireAuth, syncQuestions); // optional, for backlog syncing

export default router;
