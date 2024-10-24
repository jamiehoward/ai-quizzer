import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Question from './Question';
import Score from './Score';
import FlashMessage from './FlashMessage';
import LoadingSpinner from './LoadingSpinner';
import { generateQuestions } from '../api/openai';
import { saveQuestions, getQuestions } from '../db/database';

// Helper function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function Quiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [flashMessage, setFlashMessage] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    const currentQuiz = savedQuizzes.find(q => q.id.toString() === id);
    setQuiz(currentQuiz);
    if (currentQuiz) {
      fetchQuestions(currentQuiz);
    }
  }, [id]);

  const fetchQuestions = async (currentQuiz) => {
    setIsLoading(true);
    let fetchedQuestions = await getQuestions(currentQuiz.id);
    if (fetchedQuestions.length === 0) {
      const newQuestions = await generateQuestions(currentQuiz.subject, currentQuiz.gradeLevel, []);
      if (newQuestions && newQuestions.length > 0) {
        await saveQuestions(currentQuiz.id, newQuestions);
        fetchedQuestions = newQuestions;
      } else {
        setFlashMessage({ message: 'Failed to generate questions. Please try again.', type: 'error' });
      }
    }
    // Randomize the order of options for each question
    const randomizedQuestions = fetchedQuestions.map(q => ({
      ...q,
      options: shuffleArray([...q.options])
    }));
    setQuestions(randomizedQuestions);
    setCurrentQuestionIndex(0);
    setTotalQuestions(randomizedQuestions.length);
    setExplanation(null);
    setShowNextButton(false);
    setIsLoading(false);
  };

  const handleAnswer = (selectedAnswer) => {
    setSelectedAnswer(selectedAnswer);
    setIsAnswered(true);
    const currentQuestion = questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
      setFlashMessage({ message: 'Correct!', type: 'success' });
    } else {
      setFlashMessage({ message: `Incorrect. The correct answer was ${currentQuestion.correctAnswer}.`, type: 'error' });
    }
    const selectedOption = currentQuestion.options.find(option => option.text === selectedAnswer);
    setExplanation(selectedOption.explanation);
    setShowNextButton(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setExplanation(null);
    setShowNextButton(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setFlashMessage({ message: 'Quiz completed!', type: 'success' });
    }
  };

  if (!quiz) {
    return <div className="text-center text-xl">Quiz not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <nav className="mb-4">
        <Link to="/" className="text-blue-600 hover:text-blue-800">← Back to Dashboard</Link>
      </nav>
      <h1 className="text-3xl font-bold mb-6 text-center">{quiz.subject} Quiz (Grade {quiz.gradeLevel})</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : questions.length > 0 ? (
        <>
          <Question
            question={questions[currentQuestionIndex].question}
            options={questions[currentQuestionIndex].options || []}
            onAnswer={handleAnswer}
            selectedAnswer={selectedAnswer}
            isAnswered={isAnswered}
          />
          <Score score={score} totalQuestions={totalQuestions} />
        </>
      ) : (
        <p className="text-center text-gray-600">No questions available</p>
      )}
      {flashMessage && (
        <FlashMessage
          message={flashMessage.message}
          type={flashMessage.type}
          onClose={() => setFlashMessage(null)}
        />
      )}
      {explanation && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">Explanation:</h3>
          <p className="mb-4">{explanation}</p>
          {showNextButton && (
            <button 
              onClick={handleNextQuestion} 
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner /> : 'Next Question'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Quiz;
