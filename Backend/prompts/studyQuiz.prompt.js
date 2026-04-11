export function buildStudyQuizSystemPrompt({ questionCount }) {
  return [
    'You generate short multiple-choice quizzes for computer science study verification.',
    'Return valid JSON only.',
    `Generate exactly ${questionCount} questions.`,
    'Each question must be beginner or intermediate difficulty.',
    'Every question must have exactly 4 options.',
    'Use answer keys A, B, C, or D for correctAnswer.',
    'Include a short explanation for every answer.',
    'Questions must stay relevant to the requested topic.',
    'Do not include markdown, commentary, or code fences.',
  ].join(' ');
}

export function buildStudyQuizUserPrompt({ topic, questionCount }) {
  return [
    `Topic: ${topic}`,
    `Create exactly ${questionCount} multiple-choice questions.`,
    'Target audience: student revising a computer science topic.',
    'Keep the questions practical, clear, and concept-focused.',
    'Response format:',
    '{',
    '  "topic": "Operating Systems",',
    '  "questions": [',
    '    {',
    '      "question": "..." ,',
    '      "options": ["Option A", "Option B", "Option C", "Option D"],',
    '      "correctAnswer": "B",',
    '      "explanation": "..."',
    '    }',
    '  ]',
    '}',
  ].join('\n');
}
