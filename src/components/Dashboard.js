import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    setQuizzes(savedQuizzes);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex space-x-7">
              <div>
                <Link to="/" className="flex items-center py-4 px-2">
                  <span className="font-semibold text-gray-500 text-lg">Quiz Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Quizzes</h1>
          <Link 
            to="/new-quiz" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
          >
            Create New Quiz
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <p className="text-gray-600 text-center py-8">You haven't created any quizzes yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 ease-in-out">
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{quiz.subject}</h3>
                  <p className="text-gray-600 mb-2">Grade Level: {quiz.gradeLevel}</p>
                  <p className="text-gray-600 mb-4">
                    Score: {quiz.score || 0} / {quiz.questions ? quiz.questions.length : 0}
                  </p>
                  <Link 
                    to={`/quiz/${quiz.id}`} 
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out"
                  >
                    {quiz.score !== undefined && quiz.currentQuestionIndex < (quiz.questions ? quiz.questions.length : 0) 
                      ? 'Resume Quiz' 
                      : 'Start Quiz'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
