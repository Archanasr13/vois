import React, { useState } from 'react';
import api from '../services/api';

const AICyberCoach = ({ user }) => {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  const askCoach = async () => {
    setLoading(true);
    try {
      const res = await api.coachAdvice({ user_id: user?.id || 1, prompt: 'give me a quick tip' });
      setAdvice(res.advice || res);
    } catch (e) {
      setAdvice('Unable to reach coach.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="text-3xl text-white font-bold mb-4">AI Cyber Coach</h2>
      <p className="text-gray-300 mb-4">Ask for quick tips after simulations or quizzes.</p>
      <div>
        <button onClick={askCoach} className="px-4 py-2 bg-blue-600 rounded text-white">Get Tip</button>
      </div>
      <div className="mt-4 text-gray-200">
        {loading ? 'Thinking...' : advice}
      </div>
    </div>
  );
};

export default AICyberCoach;
