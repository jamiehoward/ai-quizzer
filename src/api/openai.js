import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateQuestions(subject, gradeLevel, previousQuestions) {
  const previousQuestionsText = previousQuestions.map(q => q.question).join('\n');
  const prompt = `Generate 10 multiple-choice questions about ${subject} suitable for grade ${gradeLevel} students. Provide the response as a JSON object with the following structure:

{
  "questions": [
    {
      "question": "Question text here",
      "options": [
        {
          "text": "Option A text",
          "explanation": "Explanation for Option A"
        },
        {
          "text": "Option B text",
          "explanation": "Explanation for Option B"
        },
        {
          "text": "Option C text",
          "explanation": "Explanation for Option C"
        },
        {
          "text": "Option D text",
          "explanation": "Explanation for Option D"
        }
      ],
      "correctAnswer": "Correct option text here"
    }
  ]
}

Ensure that:
1. Each question has exactly 4 options.
2. The "correctAnswer" matches the "text" of one of the options exactly.
3. Answers are of similar lengths to not be obvious.
4. Questions are appropriate for the specified grade level.
5. Questions are not similar to any of these previous questions:

${previousQuestionsText}

Respond only with the JSON object, no additional text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a quiz generator that responds only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2500,
      n: 1,
      stop: null,
      response_format: { type: "json_object" }
    });

    console.log('Raw OpenAI response:', response.choices[0].message.content);

    const generatedQuestions = JSON.parse(response.choices[0].message.content);
    console.log('Parsed questions:', generatedQuestions);

    return generatedQuestions.questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    return null;
  }
}

export async function generateLesson(subject, gradeLevel, question, options, correctAnswer) {
  const prompt = `Generate a short, engaging lesson about the following question for a grade ${gradeLevel} student studying ${subject}:

Question: ${question}

Options:
${options.map(opt => `- ${opt.text}`).join('\n')}

Correct Answer: ${correctAnswer}

Provide a brief explanation of the concept, why the correct answer is right, and why the other options are incorrect. Keep the explanation simple and appropriate for the grade level.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful tutor providing brief, engaging lessons for students.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
      n: 1,
      stop: null,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating lesson:', error);
    return null;
  }
}
