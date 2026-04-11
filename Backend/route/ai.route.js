import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  createStudyQuiz,
  submitStudyQuiz,
  listStudyQuizHistory,
} from '../controller/studyQuiz.controller.js';

const router = Router();

router.post('/study-quizzes/generate', requireAuth, createStudyQuiz);
router.post('/study-quizzes/:quizId/submit', requireAuth, submitStudyQuiz);
router.get('/study-quizzes', requireAuth, listStudyQuizHistory);

export default router;
