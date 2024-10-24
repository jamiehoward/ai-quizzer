// Helper function to get all quizzes
const getQuizzes = () => {
  return JSON.parse(localStorage.getItem('quizzes') || '[]');
};

// Helper function to save all quizzes
const saveQuizzes = (quizzes) => {
  localStorage.setItem('quizzes', JSON.stringify(quizzes));
};

export async function saveQuestions(quizId, questions) {
  const quizzes = getQuizzes();
  const quizIndex = quizzes.findIndex(q => q.id === quizId);
  if (quizIndex !== -1) {
    quizzes[quizIndex].questions = questions;
  } else {
    quizzes.push({ id: quizId, questions });
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
