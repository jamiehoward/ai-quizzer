import axios from 'axios';

const API_KEY = 'sk-proj-PKmDRIEF2d1C98Vjek57T3BlbkFJIW1I5YOA4f86bvE5ZCbt';
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export async function generateQuestions(topic, previousQuestions) {
  const previousQuestionsText = previousQuestions.map(q => q.question).join('\n');
  const prompt = `Generate 10 multiple-choice questions about ${topic}. Provide the response as a JSON object with the following structure:

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
4. Questions are not similar to any of these previous questions:

${previousQuestionsText}

Respond only with the JSON object, no additional text.`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a quiz generator that responds only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        n: 1,
        stop: null,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    console.log('Raw OpenAI response:', response.data.choices[0].message.content);

    const generatedQuestions = JSON.parse(response.data.choices[0].message.content);
    console.log('Parsed questions:', generatedQuestions);

    return generatedQuestions.questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    return null;
  }
}
