import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Question from './Question';
import Score from './Score';
import FlashMessage from './FlashMessage';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import { generateQuestions, generateLesson } from '../api/openai';
import { saveQuestions, getQuestions, updateQuizScore, saveQuizProgress, getQuizProgress } from '../db/database';

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
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const navigate = useNavigate();

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
      setIsGeneratingQuestions(true);
      const newQuestions = await generateQuestions(currentQuiz.subject, currentQuiz.gradeLevel, []);
      setIsGeneratingQuestions(false);
      if (newQuestions && newQuestions.length > 0) {
        await saveQuestions(currentQuiz.id, newQuestions);
        fetchedQuestions = newQuestions;
      } else {
        setFlashMessage({ message: 'Failed to generate questions. Please try again.', type: 'error' });
      }
    }
    const randomizedQuestions = fetchedQuestions.map(q => ({
      ...q,
      options: shuffleArray([...q.options])
    }));
    setQuestions(randomizedQuestions);
    setTotalQuestions(prevTotal => prevTotal + randomizedQuestions.length);

    // Retrieve saved progress
    const progress = await getQuizProgress(currentQuiz.id);
    if (progress) {
      setCurrentQuestionIndex(progress.currentQuestionIndex);
      setScore(progress.score);
    } else {
      setCurrentQuestionIndex(0);
      setScore(0);
    }

    setExplanation(null);
    setShowNextButton(false);
    setIsLoading(false);
    setQuizCompleted(false);
  };

  const handleAnswer = async (selectedAnswer) => {
    setSelectedAnswer(selectedAnswer);
    setIsAnswered(true);
    const currentQuestion = questions[currentQuestionIndex];

    if (selectedAnswer === "I don't know") {
      setIsModalOpen(true);
      setIsGeneratingLesson(true);
      const lessonContent = await generateLesson(
        quiz.subject,
        quiz.gradeLevel,
        currentQuestion.question,
        currentQuestion.options,
        currentQuestion.correctAnswer
      );
      setIsGeneratingLesson(false);
      setLesson(lessonContent);
    } else {
      if (selectedAnswer === currentQuestion.correctAnswer) {
        setScore((prev) => prev + 1);
        setFlashMessage({ message: 'Correct!', type: 'success' });
      } else {
        setFlashMessage({ message: `Incorrect. The correct answer was ${currentQuestion.correctAnswer}.`, type: 'error' });
      }
      const selectedOption = currentQuestion.options.find(option => option.text === selectedAnswer);
      setExplanation(selectedOption.explanation);
    }
    setShowNextButton(true);

    // Save progress after each answer
    await saveQuizProgress(quiz.id, currentQuestionIndex, score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0));
  };

  const handleNextQuestion = async () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setExplanation(null);
    setLesson(null);
    setShowNextButton(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      // Save progress when moving to the next question
      await saveQuizProgress(quiz.id, currentQuestionIndex + 1, score);
    } else {
      setQuizCompleted(true);
      updateQuizScore(quiz.id, score);
      setFlashMessage({ message: 'Quiz completed!', type: 'success' });
    }
  };

  const handleGenerateNewQuestions = async () => {
    setIsLoading(true);
    setIsGeneratingQuestions(true);
    const newQuestions = await generateQuestions(quiz.subject, quiz.gradeLevel, questions);
    setIsGeneratingQuestions(false);
    if (newQuestions && newQuestions.length > 0) {
      const updatedQuestions = [...questions, ...newQuestions];
      await saveQuestions(quiz.id, updatedQuestions);
      setQuestions(updatedQuestions);
      setCurrentQuestionIndex(questions.length); // Start from the first new question
      setTotalQuestions(updatedQuestions.length);
      setScore(0); // Reset the score
      setQuizCompleted(false);
      setFlashMessage({ message: 'New questions generated!', type: 'success' });
      // Reset progress when generating new questions
      await saveQuizProgress(quiz.id, questions.length, 0);
    } else {
      setFlashMessage({ message: 'Failed to generate new questions. Please try again.', type: 'error' });
    }
    setIsLoading(false);
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
        <LoadingSpinner isGeneratingQuestions={isGeneratingQuestions} />
      ) : quizCompleted ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl mb-6">Your score: {score} / {totalQuestions}</p>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Return to Dashboard
            </button>
            <button 
              onClick={handleGenerateNewQuestions}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Generate New Questions
            </button>
          </div>
        </div>
      ) : questions.length > 0 ? (
        <>
          <Question
            question={questions[currentQuestionIndex].question}
            options={[...questions[currentQuestionIndex].options, { text: "I don't know" }]}
            onAnswer={handleAnswer}
            selectedAnswer={selectedAnswer}
            isAnswered={isAnswered}
            correctAnswer={questions[currentQuestionIndex].correctAnswer}
          />
          <Score 
            score={score} 
            totalQuestions={totalQuestions} 
            currentQuestionIndex={currentQuestionIndex} 
          />
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
      {(explanation || lesson) && !quizCompleted && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          {explanation && (
            <>
              <h3 className="font-bold mb-2">Explanation:</h3>
              <p className="mb-4">{explanation}</p>
            </>
          )}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {isGeneratingLesson ? (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4">Generating lesson...</p>
          </div>
        ) : (
          <div className="text-left">
            <h2 className="text-2xl font-bold mb-4">Lesson</h2>
            <ReactMarkdown>{lesson}</ReactMarkdown>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Quiz;
