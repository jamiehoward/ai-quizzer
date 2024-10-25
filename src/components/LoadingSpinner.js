import React, { useState, useEffect } from 'react';

const phrases = [
  "Brewing up some brain teasers...",
  "Dusting off the thinking cap...",
  "Warming up the question generator...",
  "Stretching our mental muscles...",
  "Polishing up some mind-benders...",
  "Cranking up the curiosity engine...",
  "Shuffling the deck of knowledge...",
  "Firing up the quiz-o-matic...",
  "Tuning the question harmonizer...",
  "Calibrating the quiz-o-meter..."
];

function LoadingSpinner({ isGeneratingQuestions }) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    if (isGeneratingQuestions) {
      const interval = setInterval(() => {
        setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
      }, 3000); // Change phrase every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isGeneratingQuestions]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="loading-spinner mb-4"></div>
      {isGeneratingQuestions && (
        <div className="text-center">
          <p className="text-lg font-semibold animate-fade-in-out">
            {phrases[currentPhraseIndex]}
          </p>
        </div>
      )}
    </div>
  );
}

export default LoadingSpinner;
