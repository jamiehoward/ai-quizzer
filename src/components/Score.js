import React from 'react';

function Score({ score, totalQuestions }) {
  return (
    <div className="score">
      <h3>Score: {score} / {totalQuestions}</h3>
    </div>
  );
}

export default Score;
