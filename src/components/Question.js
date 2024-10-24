import React from 'react';

function Question({ question, options, onAnswer, selectedAnswer, isAnswered }) {
  // Check if options is an array, if not, try to convert it
  const optionsArray = Array.isArray(options) ? options : Object.values(options);

  return (
    <div className="question">
      <h2>{question}</h2>
      <ul>
        {optionsArray.map((option, index) => {
          const optionText = typeof option === 'object' ? option.text : option;
          const isSelected = selectedAnswer === optionText;
          return (
            <li key={index}>
              <button 
                onClick={() => onAnswer(optionText)}
                disabled={isAnswered}
                className={`answer-button ${isAnswered ? 'answered' : ''} ${isSelected ? 'selected' : ''}`}
              >
                {optionText}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Question;
