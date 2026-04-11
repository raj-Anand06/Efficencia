import mongoose from 'mongoose';
import StudyQuiz from '../model/studyQuiz.model.js';
import { generateStudyQuiz } from '../services/aiQuiz.service.js';
import {
  normalizeQuestionCount,
  normalizeThreshold,
  sanitizeTopic,
  serializeQuizForClient,
  summarizeQuizHistory,
} from '../utils/studyQuiz.js';

function getAuthenticatedUserId(req) {
  return req.auth?.userId || null;
}

function normalizeTaskSnapshot(input = {}) {
  return {
    title: sanitizeTopic(input.title),
    description: sanitizeTopic(input.description),
    isStudyTask: input.isStudyTask !== false,
  };
}

function normalizeTaskPayload(body = {}) {
  return {
    linkedTaskId: sanitizeTopic(body.linkedTaskId),
    topic: sanitizeTopic(body.topic),
    questionCount: normalizeQuestionCount(body.questionCount),
    thresholdPercent: normalizeThreshold(
      body.thresholdPercent ?? process.env.STUDY_QUIZ_PASS_THRESHOLD
    ),
    taskSnapshot: normalizeTaskSnapshot(body.taskSnapshot),
  };
}

function normalizeSubmittedAnswers(body = {}) {
  const answers = Array.isArray(body.answers) ? body.answers : [];

  return answers.map((answer) => ({
    questionIndex: Number.parseInt(answer?.questionIndex, 10),
    selectedAnswer: sanitizeTopic(answer?.selectedAnswer).toUpperCase(),
  }));
}

export async function createStudyQuiz(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized request' });
    }

    const { linkedTaskId, topic, questionCount, thresholdPercent, taskSnapshot } =
      normalizeTaskPayload(req.body);

    if (!linkedTaskId) {
      return res.status(400).json({ message: 'linkedTaskId is required' });
    }

    if (!taskSnapshot.title) {
      return res.status(400).json({ message: 'task title is required' });
    }

    if (!topic) {
      return res.status(400).json({ message: 'topic is required' });
    }

    const quizPayload = await generateStudyQuiz({ topic, questionCount });
    const studyQuiz = await StudyQuiz.create({
      user: userId,
      linkedTaskId,
      taskSnapshot,
      topic: quizPayload.topic,
      provider: quizPayload.provider,
      model: quizPayload.model,
      thresholdPercent,
      questions: quizPayload.questions,
      totalQuestions: quizPayload.questions.length,
    });

    return res.status(201).json({
      quiz: serializeQuizForClient(studyQuiz),
    });
  } catch (error) {
    console.error('createStudyQuiz error:', error);
    return res.status(502).json({
      message: error.message || 'Failed to generate study quiz',
    });
  }
}

export async function submitStudyQuiz(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    const quizId = req.params.quizId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized request' });
    }

    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Valid quizId is required' });
    }

    const studyQuiz = await StudyQuiz.findOne({ _id: quizId, user: userId });
    if (!studyQuiz) {
      return res.status(404).json({ message: 'Study quiz not found' });
    }

    if (studyQuiz.status === 'submitted') {
      return res.status(409).json({
        message: 'This quiz has already been submitted',
        quiz: serializeQuizForClient(studyQuiz),
      });
    }

    const answers = normalizeSubmittedAnswers(req.body);
    if (answers.length !== studyQuiz.questions.length) {
      return res.status(400).json({ message: 'All quiz questions must be answered' });
    }

    const gradedAnswers = studyQuiz.questions.map((question, index) => {
      const submittedAnswer = answers.find((answer) => answer.questionIndex === index);
      if (!submittedAnswer || !['A', 'B', 'C', 'D'].includes(submittedAnswer.selectedAnswer)) {
        throw new Error(`Question ${index + 1} is missing a valid answer`);
      }

      return {
        questionIndex: index,
        selectedAnswer: submittedAnswer.selectedAnswer,
        isCorrect: submittedAnswer.selectedAnswer === question.correctAnswer,
      };
    });

    const correctAnswers = gradedAnswers.filter((answer) => answer.isCorrect).length;
    const totalQuestions = studyQuiz.questions.length;
    const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = scorePercent >= studyQuiz.thresholdPercent;

    studyQuiz.userAnswers = gradedAnswers;
    studyQuiz.correctAnswers = correctAnswers;
    studyQuiz.totalQuestions = totalQuestions;
    studyQuiz.scorePercent = scorePercent;
    studyQuiz.passed = passed;
    studyQuiz.status = 'submitted';
    studyQuiz.submittedAt = new Date();
    await studyQuiz.save();

    return res.json({
      quiz: serializeQuizForClient(studyQuiz),
      canMarkComplete: passed,
    });
  } catch (error) {
    console.error('submitStudyQuiz error:', error);
    return res.status(400).json({
      message: error.message || 'Failed to submit study quiz',
    });
  }
}

export async function listStudyQuizHistory(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized request' });
    }

    const limit = Math.min(
      10,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 5)
    );

    const rows = await StudyQuiz.find({ user: userId, status: 'submitted' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({
      quizzes: rows.map(summarizeQuizHistory),
    });
  } catch (error) {
    console.error('listStudyQuizHistory error:', error);
    return res.status(500).json({ message: 'Failed to load study quiz history' });
  }
}
