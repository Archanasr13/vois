import React, { useState, useEffect } from 'react';

const QuizCard = ({ question, onAnswer, questionNumber, totalQuestions }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    // Show result/explanation for this question first. Parent will be notified when user
    // clicks Next so they have time to read the explanation.
    setShowResult(true);
  };

  // Reset local selection/result when a new question is provided
  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
  }, [question?.id]);

  const getAnswerClass = (index) => {
    if (!showResult) {
      return selectedAnswer === index
        ? 'bg-blue-600 text-white'
        : 'bg-gray-700 text-gray-200 hover:bg-gray-600';
    }
    
    if (index === question.correct_option) {
      return 'bg-green-600 text-white';
    }
    
    if (index === selectedAnswer && index !== question.correct_option) {
      return 'bg-red-600 text-white';
    }
    
    return 'bg-gray-700 text-gray-400';
  };

  return (
    <div className="glassmorphism rounded-xl p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-300">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-300 bg-blue-600 px-2 py-1 rounded">
            {question.category}
          </span>
        </div>
        
        <h3 className="text-white text-xl font-semibold mb-6">
          {question.question}
        </h3>
        
        <div className="space-y-3">
          {Array.isArray(question.options) && question.options.length > 0 ? (
            question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${getAnswerClass(index)}`}
                disabled={showResult}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
              </button>
            ))
          ) : (
            <div className="p-6 bg-gray-800 rounded-lg text-gray-300">
              <p>No options available for this question.</p>
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    // Record a null answer and let parent advance
                    onAnswer(null);
                  }}
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all duration-200"
                >
                  Skip Question
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {!showResult && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200"
          >
            Submit Answer
          </button>
        </div>
      )}

      {showResult && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <div className="mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedAnswer === question.correct_option
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}>
              {selectedAnswer === question.correct_option ? '✅ Correct!' : '❌ Incorrect'}
            </span>
          </div>
          <p className="text-gray-200 text-sm">
            <strong>Explanation:</strong> {question.explanation}
          </p>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                // Notify parent about the chosen answer so it can advance or submit the quiz
                onAnswer(selectedAnswer);
                // Reset local state so when the next question mounts it's fresh
                setShowResult(false);
                setSelectedAnswer(null);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200"
            >
              Next Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCard;


