import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthProvider.jsx';
import { buildAuthConfig } from '../utils/auth.js';

function buildInitialAnswers(questions = []) {
  return questions.reduce((acc, _question, index) => {
    acc[index] = '';
    return acc;
  }, {});
}

function StudyTaskQuizModal({ task, open, onClose, onTaskVerified }) {
  const { token } = useAuth();
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:1402';

  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open || !task) return;

    setTopic(task.title || '');
    setQuiz(null);
    setAnswers({});
    setLoading(false);
    setSubmitting(false);
    setError('');
    setResult(null);
  }, [open, task]);

  const unansweredCount = useMemo(() => {
    if (!quiz?.questions?.length) return 0;
    return quiz.questions.filter((_, index) => !answers[index]).length;
  }, [answers, quiz]);

  if (!open || !task) {
    return null;
  }

  const handleGenerateQuiz = async () => {
    if (!token) {
      toast.error('Please sign in to use study verification');
      return;
    }

    if (!topic.trim()) {
      setError('Please enter the topic you studied before generating a quiz.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const { data } = await axios.post(
        `${baseURL}/ai/study-quizzes/generate`,
        {
          linkedTaskId: task.id,
          topic: topic.trim(),
          taskSnapshot: {
            title: task.title,
            description: task.description,
            isStudyTask: true,
          },
        },
        buildAuthConfig(token)
      );

      setQuiz(data.quiz);
      setAnswers(buildInitialAnswers(data.quiz.questions));
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Failed to generate the study quiz.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, selectedAnswer) => {
    setAnswers((current) => ({
      ...current,
      [questionIndex]: selectedAnswer,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz?._id || !token) return;
    if (unansweredCount > 0) {
      setError('Answer every question before submitting the quiz.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const { data } = await axios.post(
        `${baseURL}/ai/study-quizzes/${quiz._id}/submit`,
        {
          answers: Object.entries(answers).map(([questionIndex, selectedAnswer]) => ({
            questionIndex: Number(questionIndex),
            selectedAnswer,
          })),
        },
        buildAuthConfig(token)
      );

      setResult(data);
      setQuiz(data.quiz);
      if (data.canMarkComplete) {
        toast.success('Quiz passed. You can now mark this task complete.');
      } else {
        toast.error('Quiz score was below the pass threshold.');
      }
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Failed to submit the quiz.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizeCompletion = () => {
    if (!result?.quiz || !result?.canMarkComplete) return;
    onTaskVerified(result.quiz);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
      <div className="app-card-strong max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="app-subtle-copy text-xs font-semibold uppercase tracking-[0.3em]">
              Study Verification
            </p>
            <h2 className="app-heading mt-3 text-2xl font-semibold md:text-3xl">
              Verify learning before completing this task
            </h2>
            <p className="app-copy mt-2 max-w-2xl text-sm leading-7">
              Study tasks require a short quiz. If your score is at least{' '}
              {quiz?.thresholdPercent || 70}%, the task can be marked complete.
            </p>
          </div>

          <button
            type="button"
            className="app-button-secondary rounded-xl px-4 py-2"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="app-soft-card mt-6 rounded-2xl p-4">
          <p className="dashboard-subtle text-xs uppercase tracking-[0.24em]">
            Task
          </p>
          <p className="dashboard-text mt-2 text-lg font-semibold">{task.title}</p>
          {task.description ? (
            <p className="dashboard-muted mt-1 text-sm leading-6">{task.description}</p>
          ) : null}
        </div>

        {!quiz ? (
          <div className="mt-6 space-y-4">
            <div>
              <label className="dashboard-text mb-2 block text-sm font-semibold">
                What topic did you study?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Example: Operating Systems scheduling"
                className="app-input w-full rounded-xl px-4 py-3"
              />
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="app-button-primary rounded-xl px-4 py-3"
                onClick={handleGenerateQuiz}
                disabled={loading}
              >
                {loading ? 'Generating quiz...' : 'Generate AI quiz'}
              </button>
              <button
                type="button"
                className="app-button-secondary rounded-xl px-4 py-3"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="dashboard-subtle text-xs uppercase tracking-[0.24em]">
                  Quiz Topic
                </p>
                <p className="dashboard-text mt-1 text-lg font-semibold">{quiz.topic}</p>
              </div>
              <div className="app-soft-card rounded-2xl px-4 py-3">
                <p className="dashboard-subtle text-xs uppercase tracking-[0.24em]">
                  Questions
                </p>
                <p className="dashboard-text mt-1 text-sm font-medium">
                  {quiz.questions.length} total
                </p>
              </div>
            </div>

            {quiz.questions.map((question, index) => {
              const questionResult = quiz.userAnswers?.find(
                (answer) => answer.questionIndex === index
              );

              return (
                <div key={`${quiz._id}_${index}`} className="app-soft-card rounded-2xl p-5">
                  <p className="dashboard-text text-base font-semibold">
                    {index + 1}. {question.question}
                  </p>

                  <div className="mt-4 grid gap-3">
                    {question.options.map((option, optionIndex) => {
                      const answerKey = ['A', 'B', 'C', 'D'][optionIndex];
                      const isSelected = answers[index] === answerKey;
                      const isCorrect = result && question.correctAnswer === answerKey;
                      const isWrongSelection =
                        result &&
                        questionResult?.selectedAnswer === answerKey &&
                        !questionResult?.isCorrect;

                      return (
                        <label
                          key={`${index}_${answerKey}`}
                          className={`rounded-2xl border px-4 py-3 transition ${
                            isCorrect
                              ? 'border-emerald-400/40 bg-emerald-500/15'
                              : isWrongSelection
                                ? 'border-rose-400/40 bg-rose-500/15'
                                : 'border-[var(--dashboard-border)] bg-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name={`question_${index}`}
                              className="mt-1"
                              checked={isSelected}
                              disabled={Boolean(result)}
                              onChange={() => handleAnswerChange(index, answerKey)}
                            />
                            <div>
                              <p className="dashboard-text text-sm font-medium">
                                {answerKey}. {option}
                              </p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {result ? (
                    <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
                      <p className="dashboard-text text-sm font-semibold">
                        Correct answer: {question.correctAnswer}
                      </p>
                      <p className="dashboard-muted mt-1 text-sm leading-6">
                        {question.explanation}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            {result ? (
              <div className="app-card rounded-[28px] p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="dashboard-subtle text-xs uppercase tracking-[0.24em]">
                      Result
                    </p>
                    <p className="dashboard-text mt-2 text-2xl font-semibold">
                      {result.quiz.scorePercent}% score
                    </p>
                    <p className="dashboard-muted mt-1 text-sm">
                      {result.quiz.correctAnswers} out of {result.quiz.totalQuestions} answers correct
                    </p>
                  </div>

                  <div
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      result.canMarkComplete
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {result.canMarkComplete ? 'Passed' : 'Below threshold'}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {result.canMarkComplete ? (
                    <button
                      type="button"
                      className="app-button-primary rounded-xl px-4 py-3"
                      onClick={handleFinalizeCompletion}
                    >
                      Mark task completed
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="app-button-secondary rounded-xl px-4 py-3"
                    onClick={onClose}
                  >
                    {result.canMarkComplete ? 'Close' : 'Close and keep task active'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="app-button-primary rounded-xl px-4 py-3"
                  onClick={handleSubmitQuiz}
                  disabled={submitting || unansweredCount > 0}
                >
                  {submitting
                    ? 'Submitting quiz...'
                    : unansweredCount > 0
                      ? `Answer ${unansweredCount} more question${unansweredCount === 1 ? '' : 's'}`
                      : 'Submit quiz'}
                </button>
                <button
                  type="button"
                  className="app-button-secondary rounded-xl px-4 py-3"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyTaskQuizModal;
