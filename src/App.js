import React, { useState } from 'react';
import QuizForm from './components/QuizForm';
import Question from './components/Question';
import Score from './components/Score';
import FlashMessage from './components/FlashMessage';
import LoadingSpinner from './components/LoadingSpinner';
import { generateQuestions } from './api/openai';
import './App.css';

function App() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [flashMessage, setFlashMessage] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showChatButton, setShowChatButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleTopicSubmit = async (newTopic) => {
    setTopic(newTopic);
    setIsLoading(true);
    await fetchNewQuestions(newTopic);
    setIsLoading(false);
  };

  const fetchNewQuestions = async (currentTopic) => {
    const newQuestions = await generateQuestions(currentTopic, questions);
    console.log('Fetched questions in App.js:', newQuestions);
    if (newQuestions && newQuestions.length > 0) {
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setTotalQuestions((prev) => prev + newQuestions.length);
      setExplanation(null);
      setShowNextButton(false);
      setShowChatButton(false);
    } else {
      setFlashMessage({ message: 'Failed to generate questions. Please try again.', type: 'error' });
    }
  };

  const handleAnswer = (selectedAnswer) => {
    setSelectedAnswer(selectedAnswer);
    setIsAnswered(true);

    const currentQuestion = questions[currentQuestionIndex];
    console.log('Current question:', currentQuestion);
    const options = Array.isArray(currentQuestion.options) 
      ? currentQuestion.options 
      : Object.values(currentQuestion.options);
    
    console.log('Options:', options);
    
    const selectedOption = options.find(option => 
      (typeof option === 'object' ? option.text : option) === selectedAnswer
    );
    
    console.log('Selected option:', selectedOption);
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
      setFlashMessage({ message: 'Correct!', type: 'success' });
      setExplanation(typeof selectedOption === 'object' ? selectedOption.explanation : 'Correct answer');
      setShowNextButton(true);
    } else {
      const correctOption = options.find(option => 
        (typeof option === 'object' ? option.text : option) === currentQuestion.correctAnswer
      );
      console.log('Correct option:', correctOption);
      setFlashMessage({ message: `Incorrect. The correct answer was ${currentQuestion.correctAnswer}.`, type: 'error' });
      setExplanation(`Your answer: ${typeof selectedOption === 'object' ? selectedOption.explanation : 'No explanation available'}\n\nCorrect answer: ${typeof correctOption === 'object' ? correctOption.explanation : 'No explanation available'}`);
      setShowNextButton(true);
      setShowChatButton(true);
    }
  };

  const handleNextQuestion = async () => {
    setIsLoading(true);
    setSelectedAnswer(null);
    setIsAnswered(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setExplanation(null);
      setShowNextButton(false);
      setShowChatButton(false);
    } else {
      await fetchNewQuestions(topic);
    }
    setIsLoading(false);
  };

  const handleStartChat = () => {
    // Implement chat functionality here
    console.log("Starting chat about the question...");
  };

  return (
    <div className="App">
      <h1>AI-Powered Quiz App</h1>
      <QuizForm onTopicSubmit={handleTopicSubmit} isLoading={isLoading} />
      {questions.length > 0 && !isLoading && (
        <Question
          question={questions[currentQuestionIndex].question}
          options={questions[currentQuestionIndex].options || []}
          onAnswer={handleAnswer}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
        />
      )}
      <Score score={score} totalQuestions={totalQuestions} />
      {flashMessage && (
        <FlashMessage
          message={flashMessage.message}
          type={flashMessage.type}
          onClose={() => setFlashMessage(null)}
        />
      )}
      {explanation && (
        <div className="explanation">
          <h3>Explanation:</h3>
          <p>{explanation}</p>
          {showNextButton && (
            <button onClick={handleNextQuestion} disabled={isLoading}>
              {isLoading ? <LoadingSpinner /> : 'Next Question'}
            </button>
          )}
          {showChatButton && (
            <button onClick={handleStartChat} disabled={isLoading}>
              Start Chat
            </button>
          )}
        </div>
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  );
}

export default App;
