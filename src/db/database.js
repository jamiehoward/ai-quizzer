// Helper function to get all quizzes
const getQuizzes = () => {
  return JSON.parse(localStorage.getItem('quizzes') || '[]');
};

// Helper function to save all quizzes
const saveQuizzes = (quizzes) => {
  localStorage.setItem('quizzes', JSON.stringify(quizzes));
};

export async function saveQuestions(quizId, questions, score = 0) {
  const quizzes = getQuizzes();
  const quizIndex = quizzes.findIndex(q => q.id === quizId);
  if (quizIndex !== -1) {
    quizzes[quizIndex].questions = questions;
    quizzes[quizIndex].score = score;
  } else {
    quizzes.push({ id: quizId, questions, score });
  }
  saveQuizzes(quizzes);
}

export async function getQuestions(quizId) {
  const quizzes = getQuizzes();
  const quiz = quizzes.find(q => q.id === quizId);
  return quiz ? quiz.questions : [];
}

export async function clearQuestions(quizId) {
  const quizzes = getQuizzes();
  const quizIndex = quizzes.findIndex(q => q.id === quizId);
  if (quizIndex !== -1) {
    quizzes[quizIndex].questions = [];
    saveQuizzes(quizzes);
  }
}

// Add a new function to update the score
export async function updateQuizScore(quizId, score) {
  const quizzes = getQuizzes();
  const quizIndex = quizzes.findIndex(q => q.id === quizId);
  if (quizIndex !== -1) {
    quizzes[quizIndex].score = score;
    saveQuizzes(quizzes);
  }
}

export async function saveQuizProgress(quizId, currentQuestionIndex, score) {
  const quizzes = getQuizzes();
  const quizIndex = quizzes.findIndex(q => q.id === quizId);
  if (quizIndex !== -1) {
    quizzes[quizIndex].currentQuestionIndex = currentQuestionIndex;
    quizzes[quizIndex].score = score;
    saveQuizzes(quizzes);
  }
}

export async function getQuizProgress(quizId) {
  const quizzes = getQuizzes();
  const quiz = quizzes.find(q => q.id === quizId);
  return quiz ? {
    currentQuestionIndex: quiz.currentQuestionIndex || 0,
    score: quiz.score || 0
  } : null;
}
