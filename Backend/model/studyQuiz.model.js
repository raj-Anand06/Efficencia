import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 4 && value.every(Boolean),
        message: 'Each question must have exactly 4 options',
      },
    },
    correctAnswer: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D'],
    },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const UserAnswerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true, min: 0 },
    selectedAnswer: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const TaskSnapshotSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    isStudyTask: { type: Boolean, default: true },
  },
  { _id: false }
);

const StudyQuizSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    linkedTaskId: { type: String, required: true, trim: true },
    taskSnapshot: { type: TaskSnapshotSchema, required: true },
    topic: { type: String, required: true, trim: true },
    provider: { type: String, required: true, enum: ['openai', 'gemini', 'fallback'] },
    model: { type: String, required: true },
    thresholdPercent: { type: Number, required: true, default: 70 },
    status: { type: String, required: true, enum: ['generated', 'submitted'], default: 'generated' },
    questions: {
      type: [QuestionSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 5 && value.length <= 10,
        message: 'A study quiz must contain between 5 and 10 questions',
      },
    },
    userAnswers: { type: [UserAnswerSchema], default: [] },
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    scorePercent: { type: Number, default: null },
    passed: { type: Boolean, default: null },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

StudyQuizSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('StudyQuiz', StudyQuizSchema);
