import React from 'react';

function Score({ score, totalQuestions, currentQuestionIndex }) {
  return (
    <div className="score">
      <h3>Question {currentQuestionIndex + 1} of {totalQuestions}</h3>
      <h3>Score: {score} / {totalQuestions}</h3>
    </div>
  );
}

export default Score;
