import React, { useState, useEffect } from 'react';

const ResultModal = ({ isOpen, onClose, result, type }) => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Text-to-Speech functionality
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Cleanup speech on unmount or close
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!isOpen) return null;

  const getResultContent = () => {
    if (type === 'simulation') {
      return {
        title: result.isCorrect ? '✅ Excellent!' : '⚠️ Be More Careful',
        message: result.message,
        color: result.isCorrect ? 'green' : 'red',
        icon: result.isCorrect ? '🛡️' : '⚠️'
      };
    } else if (type === 'quiz') {
      return {
        title: `Quiz Complete!`,
        message: `You scored ${result.score}% (${result.correctAnswers}/${result.totalQuestions} correct)`,
        color: result.score >= 80 ? 'green' : result.score >= 60 ? 'yellow' : 'red',
        icon: result.score >= 80 ? '🎉' : result.score >= 60 ? '👍' : '📚'
      };
    }
    return { title: '', message: '', color: 'blue', icon: 'ℹ️' };
  };

  const content = getResultContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="glassmorphism rounded-xl p-8 max-w-2xl w-full my-8">
        <div className="text-center">
          <div className="text-6xl mb-4">{content.icon}</div>
          <h2 className={`text-2xl font-bold mb-4 text-${content.color}-400`}>
            {content.title}
          </h2>
          <p className="text-gray-200 mb-6">
            {content.message}
          </p>

          {type === 'quiz' && (
            <>
              <div className="mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-2">Your Score</div>
                  <div className="text-3xl font-bold text-white">
                    {result.score}%
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {result.correctAnswers} out of {result.totalQuestions} correct
                  </div>
                </div>
              </div>

              {/* Show questions with explanations */}
              {result.questions && result.questions.length > 0 && (
                <div className="mb-6 text-left max-h-96 overflow-y-auto">
                  <h3 className="font-semibold text-white mb-3">Review Your Answers</h3>
                  <div className="space-y-3">
                    {result.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg p-3 border ${q.isCorrect ? 'bg-green-900 border-green-700' : 'bg-red-900 border-red-700'}`}
                      >
                        <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}>
                          <div>
                            <div className="font-medium text-white text-sm">
                              {q.isCorrect ? '✅' : '❌'} Question {idx + 1}
                            </div>
                            <div className="text-xs text-gray-200 mt-1">{q.question}</div>
                          </div>
                          <div className="text-xs">{expandedQuestion === idx ? '−' : '+'}</div>
                        </div>
                        {expandedQuestion === idx && (
                          <div className="mt-2 text-xs text-gray-100 border-t border-opacity-30 border-white pt-2">
                            <div className="mb-1"><strong>Your answer:</strong> {q.options?.[q.userAnswer] || 'Not answered'}</div>
                            <div className="mb-1"><strong>Correct answer:</strong> {q.options?.[q.correct_option] || 'N/A'}</div>
                            {q.explanation && <div><strong>Explanation:</strong> {q.explanation}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TTS Button for simulation results */}
          {type === 'simulation' && (
            <div className="mb-6">
              <button
                onClick={() => isSpeaking ? stopSpeaking() : speakText(content.message + '. ' + (result.isCorrect ? 'Great job! You correctly identified this email.' : 'Please be more careful next time and review the warning signs.'))}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto ${isSpeaking
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                  } text-white`}
              >
                {isSpeaking ? (
                  <>
                    <span className="animate-pulse">🔊</span>
                    Stop Audio
                  </>
                ) : (
                  <>
                    🔊 Hear Feedback
                  </>
                )}
              </button>
            </div>
          )}

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200"
            >
              Continue
            </button>
            {type === 'simulation' && (
              <button
                onClick={() => window.location.href = '/quiz'}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                Take Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;


