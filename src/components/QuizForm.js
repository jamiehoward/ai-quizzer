import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

function QuizForm({ onTopicSubmit, isLoading }) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onTopicSubmit(topic);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter a topic"
        required
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? <LoadingSpinner /> : 'Start Quiz'}
      </button>
    </form>
  );
}

export default QuizForm;
