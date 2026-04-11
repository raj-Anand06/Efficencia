import { buildStudyQuizSystemPrompt, buildStudyQuizUserPrompt } from '../prompts/studyQuiz.prompt.js';
import { generateFallbackStudyQuiz } from './fallbackQuiz.service.js';
import {
  STUDY_QUIZ_JSON_SCHEMA,
  normalizeQuestionCount,
  parseStudyQuizPayload,
} from '../utils/studyQuiz.js';

const GEMINI_STUDY_QUIZ_SCHEMA = {
  type: 'object',
  properties: {
    topic: { type: 'string' },
    questions: {
      type: 'array',
      minItems: 5,
      maxItems: 10,
      items: {
        type: 'object',
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
        required: ['question', 'options', 'correctAnswer', 'explanation'],
        propertyOrdering: ['question', 'options', 'correctAnswer', 'explanation'],
      },
    },
  },
  required: ['topic', 'questions'],
  propertyOrdering: ['topic', 'questions'],
};

function extractGeminiErrorMessage(payload) {
  return (
    payload?.error?.message ||
    payload?.promptFeedback?.blockReasonMessage ||
    payload?.promptFeedback?.blockReason ||
    'Gemini quiz generation failed'
  );
}

function extractGeminiText(payload) {
  const rawText =
    payload?.candidates?.[0]?.content?.parts?.find((part) => typeof part?.text === 'string')?.text;

  if (!rawText) {
    throw new Error('Gemini response did not contain quiz text');
  }

  return rawText;
}

function shouldRetryGeminiWithoutSchema(status, message) {
  if (status !== 400) {
    return false;
  }

  return /schema|responsejsonschema|response_schema|invalid json payload|additionalproperties/i.test(
    String(message || '')
  );
}

function shouldUseFallbackQuiz(error) {
  const message = String(error?.message || '');
  return /quota|billing|rate.?limit|resource.?exhausted|retry in|too many requests/i.test(message);
}

async function sendGeminiGenerateRequest({ apiKey, model, body }) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    }
  );

  const payload = await response.json();
  return { response, payload };
}

function getAiProvider() {
  const explicitProvider = (process.env.AI_PROVIDER || '').trim().toLowerCase();
  if (explicitProvider) {
    return explicitProvider;
  }

  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  return '';
}

function extractOpenAiText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text;
  }

  const contentBlocks = Array.isArray(payload?.output)
    ? payload.output.flatMap((item) => item?.content || [])
    : [];

  const textBlock = contentBlocks.find(
    (item) => item?.type === 'output_text' && typeof item?.text === 'string'
  );

  if (textBlock?.text) {
    return textBlock.text;
  }

  throw new Error('OpenAI response did not contain quiz text');
}

async function requestOpenAiQuiz({ topic, questionCount }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: buildStudyQuizSystemPrompt({ questionCount }),
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: buildStudyQuizUserPrompt({ topic, questionCount }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'study_quiz',
          schema: STUDY_QUIZ_JSON_SCHEMA,
          strict: true,
        },
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'OpenAI quiz generation failed');
  }

  return {
    provider: 'openai',
    model: payload?.model || process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    rawText: extractOpenAiText(payload),
  };
}

async function requestGeminiQuiz({ topic, questionCount }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const promptText = `${buildStudyQuizSystemPrompt({ questionCount })}\n\n${buildStudyQuizUserPrompt({
    topic,
    questionCount,
  })}`;

  const buildGeminiRequestBody = (useStructuredSchema) => ({
    contents: [
      {
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      ...(useStructuredSchema ? { responseJsonSchema: GEMINI_STUDY_QUIZ_SCHEMA } : {}),
    },
  });

  let { response, payload } = await sendGeminiGenerateRequest({
    apiKey,
    model,
    body: buildGeminiRequestBody(true),
  });

  if (!response.ok) {
    const errorMessage = extractGeminiErrorMessage(payload);

    if (shouldRetryGeminiWithoutSchema(response.status, errorMessage)) {
      ({ response, payload } = await sendGeminiGenerateRequest({
        apiKey,
        model,
        body: buildGeminiRequestBody(false),
      }));
    }
  }

  if (!response.ok) {
    throw new Error(extractGeminiErrorMessage(payload));
  }

  return {
    provider: 'gemini',
    model,
    rawText: extractGeminiText(payload),
  };
}

export async function generateStudyQuiz({ topic, questionCount: requestedCount }) {
  const questionCount = normalizeQuestionCount(requestedCount);
  const provider = getAiProvider();

  if (!provider) {
    throw new Error('No AI provider is configured. Set AI_PROVIDER or an API key.');
  }

  try {
    const result =
      provider === 'gemini'
        ? await requestGeminiQuiz({ topic, questionCount })
        : await requestOpenAiQuiz({ topic, questionCount });

    const quizPayload = parseStudyQuizPayload(result.rawText, questionCount);

    return {
      ...quizPayload,
      provider: result.provider,
      model: result.model,
      questionCount,
    };
  } catch (error) {
    if (!shouldUseFallbackQuiz(error)) {
      throw error;
    }

    console.warn('AI quiz fallback activated:', error.message);

    const fallbackQuiz = generateFallbackStudyQuiz({ topic, questionCount });

    return {
      ...fallbackQuiz,
      provider: 'fallback',
      model: 'offline-study-bank',
      questionCount,
    };
  }
}
