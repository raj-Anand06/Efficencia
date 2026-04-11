const VALID_ANSWER_KEYS = ['A', 'B', 'C', 'D'];

export const STUDY_QUIZ_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['topic', 'questions'],
  properties: {
    topic: { type: 'string' },
    questions: {
      type: 'array',
      minItems: 5,
      maxItems: 10,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['question', 'options', 'correctAnswer', 'explanation'],
        properties: {
          question: { type: 'string' },
          options: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: { type: 'string' },
          },
          correctAnswer: { type: 'string' },
          explanation: { type: 'string' },
        },
      },
    },
  },
};

export function normalizeQuestionCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 5;
  return Math.min(10, Math.max(5, parsed));
}

export function normalizeThreshold(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 70;
  return Math.min(100, Math.max(1, parsed));
}

export function sanitizeTopic(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function extractJsonBlock(text) {
  if (typeof text !== 'string') {
    throw new Error('AI response was not text');
  }

  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  throw new Error('Could not extract quiz JSON from AI response');
}

function normalizeAnswerKey(correctAnswer, options) {
  const raw = typeof correctAnswer === 'string' ? correctAnswer.trim().toUpperCase() : '';
  if (VALID_ANSWER_KEYS.includes(raw)) {
    return raw;
  }

  const optionIndex = options.findIndex(
    (option) => option.trim().toLowerCase() === String(correctAnswer || '').trim().toLowerCase()
  );

  if (optionIndex >= 0) {
    return VALID_ANSWER_KEYS[optionIndex];
  }

  throw new Error('Quiz response contained an invalid correct answer');
}

export function parseStudyQuizPayload(rawPayload, expectedQuestionCount) {
  const source =
    typeof rawPayload === 'string'
      ? JSON.parse(extractJsonBlock(rawPayload))
      : rawPayload;

  const topic = sanitizeTopic(source?.topic);
  const rawQuestions = Array.isArray(source?.questions) ? source.questions : [];

  if (!topic) {
    throw new Error('Quiz topic is missing');
  }

  if (rawQuestions.length < 5) {
    throw new Error('Quiz did not contain enough questions');
  }

  const questions = rawQuestions.slice(0, expectedQuestionCount).map((item, index) => {
    const question = sanitizeTopic(item?.question);
    const options = Array.isArray(item?.options)
      ? item.options.map((option) => sanitizeTopic(option))
      : [];

    if (!question) {
      throw new Error(`Question ${index + 1} is missing text`);
    }

    if (options.length !== 4 || options.some((option) => !option)) {
      throw new Error(`Question ${index + 1} must have exactly 4 non-empty options`);
    }

    return {
      question,
      options,
      correctAnswer: normalizeAnswerKey(item?.correctAnswer, options),
      explanation: sanitizeTopic(item?.explanation) || 'No explanation provided.',
    };
  });

  if (questions.length < expectedQuestionCount) {
    throw new Error('Quiz did not contain the expected number of valid questions');
  }

  return { topic, questions };
}

export function serializeQuizForClient(quizDocument) {
  return {
    _id: quizDocument._id,
    topic: quizDocument.topic,
    linkedTaskId: quizDocument.linkedTaskId,
    taskSnapshot: quizDocument.taskSnapshot,
    thresholdPercent: quizDocument.thresholdPercent,
    status: quizDocument.status,
    totalQuestions: quizDocument.totalQuestions,
    correctAnswers: quizDocument.correctAnswers,
    scorePercent: quizDocument.scorePercent,
    passed: quizDocument.passed,
    createdAt: quizDocument.createdAt,
    submittedAt: quizDocument.submittedAt,
    userAnswers: quizDocument.userAnswers,
    questions: quizDocument.questions.map((question, index) => ({
      questionIndex: index,
      question: question.question,
      options: question.options,
      explanation:
        quizDocument.status === 'submitted' ? question.explanation : undefined,
      correctAnswer:
        quizDocument.status === 'submitted' ? question.correctAnswer : undefined,
    })),
  };
}

export function summarizeQuizHistory(quizDocument) {
  return {
    _id: quizDocument._id,
    topic: quizDocument.topic,
    linkedTaskId: quizDocument.linkedTaskId,
    taskSnapshot: quizDocument.taskSnapshot,
    thresholdPercent: quizDocument.thresholdPercent,
    totalQuestions: quizDocument.totalQuestions,
    correctAnswers: quizDocument.correctAnswers,
    scorePercent: quizDocument.scorePercent,
    passed: quizDocument.passed,
    createdAt: quizDocument.createdAt,
    submittedAt: quizDocument.submittedAt,
  };
}
