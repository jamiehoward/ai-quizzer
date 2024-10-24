import React from 'react';

function Question({ question, options, onAnswer, selectedAnswer, isAnswered }) {
  const optionsArray = Array.isArray(options) ? options : Object.values(options);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{question}</h2>
      <ul className="space-y-2">
        {optionsArray.map((option, index) => {
          const optionText = typeof option === 'object' ? option.text : option;
          const isSelected = selectedAnswer === optionText;
          return (
            <li key={index}>
              <button 
                onClick={() => onAnswer(optionText)}
                disabled={isAnswered}
                className={`w-full text-left p-3 rounded ${
                  isAnswered 
                    ? 'bg-gray-200 cursor-not-allowed' 
                    : 'bg-blue-100 hover:bg-blue-200'
                } ${isSelected ? 'border-2 border-blue-500 font-bold' : ''}`}
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
