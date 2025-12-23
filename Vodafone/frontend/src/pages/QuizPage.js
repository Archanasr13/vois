import React, { useState, useEffect } from 'react';
import QuizCard from '../components/QuizCard';
import ResultModal from '../components/ResultModal';

const QuizPage = ({ user }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Use relative path - allow frontend proxy or same origin to work
      const response = await fetch('/api/get_quiz_questions');
      if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(`Server ${response.status}: ${response.statusText} ${text ? '- ' + text : ''}`);
      }
      const data = await response.json();

      // Defensive: ensure we have an array of questions
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(data?.error || 'No quiz questions returned from server');
      }

      // Ensure options exists as array for each question
      const normalized = data.map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : (q.options || []),
      }));

      setQuestions(normalized);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setErrorMessage(error.message || 'Unable to load quiz questions.');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    try {
      const response = await fetch('http://localhost:5000/api/submit_quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || 1,
          answers: finalAnswers,
          questions: questions
        }),
      });
      
      const data = await response.json();
      
      // Include questions in result for displaying explanations
      setQuizResult({
        score: data.score,
        correctAnswers: data.correct_answers,
        totalQuestions: data.total_questions,
        newTotalScore: data.new_total_score,
        questions: questions.map((q, idx) => ({
          ...q,
          userAnswer: finalAnswers[idx],
          isCorrect: finalAnswers[idx] === q.correct_option
        }))
      });
      
      setShowResult(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setQuizResult(null);
    // Reset quiz
    setCurrentQuestion(0);
    setAnswers([]);
    fetchQuestions();
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setQuizResult(null);
    fetchQuestions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Quiz</h2>
          <p className="text-gray-300 mb-4">{errorMessage || 'Unable to load quiz questions. Please try again.'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchQuestions}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-200"
            >
              Refresh Page
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">If the problem persists, check that the backend is running on port 5000 and CORS/proxy is configured.</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <ResultModal
        isOpen={showResult}
        onClose={handleCloseResult}
        result={quizResult}
        type="quiz"
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 font-cyber">
          Cybersecurity Awareness Quiz
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Test your knowledge of cybersecurity best practices. 
          Answer all questions to get your awareness score.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="glassmorphism rounded-xl p-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Progress</span>
            <span className="text-sm text-gray-300">
              {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <QuizCard
        key={questions[currentQuestion].id}
        question={questions[currentQuestion]}
        onAnswer={handleAnswer}
        questionNumber={currentQuestion + 1}
        totalQuestions={questions.length}
      />

      <div className="mt-8 text-center">
        <button
          onClick={restartQuiz}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-200"
        >
          Restart Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizPage;


