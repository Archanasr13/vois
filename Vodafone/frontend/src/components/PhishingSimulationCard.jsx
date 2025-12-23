import React, { useState, useEffect } from 'react';
import API from '../services/api';

const PhishingSimulationCard = ({ user }) => {
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');

  useEffect(() => {
    loadSimulation();
  }, [difficulty, user?.id]);

  const loadSimulation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      console.log('Loading simulation with difficulty:', difficulty, 'user_id:', user?.id);
      const sim = await API.getPhishingSimulation({
        user_id: user?.id || 1,
        difficulty: difficulty
      });
      console.log('Received simulation:', sim);
      if (sim && sim.body) {
        setSimulation(sim);
      } else {
        console.error('Invalid simulation response:', sim);
        setError('Failed to load simulation. Please try again.');
      }
    } catch (err) {
      console.error('Failed to load simulation:', err);
      setError(`Error: ${err.message || 'Unable to load simulation'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (clicked) => {
    try {
      const response = await API.trackPhishingClick({
        user_id: user?.id,
        simulation_id: simulation?.id,
        clicked: clicked
      });
      setResult(response);
      // Speak feedback using browser TTS
      speakFeedback(response.message);
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  const speakFeedback = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Loading simulation...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-400">
        <p>{error}</p>
        <button
          onClick={loadSimulation}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!simulation || !simulation.body) {
    return <div className="p-4 text-center text-gray-400">No simulation available</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="bg-gray-900 rounded p-4 mb-6 border border-gray-700 font-mono text-sm max-h-64 overflow-y-auto whitespace-pre-wrap break-words">
        <div className="text-gray-300">{simulation?.body || 'Loading email...'}</div>
      </div>

      {!result && (
        <div className="flex gap-4">
          <button
            onClick={() => handleClick(true)}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
          >
            Click the Link
          </button>
          <button
            onClick={() => handleClick(false)}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
          >
            Ignore Email
          </button>
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-lg border ${result.new_score > 0 ? 'bg-green-900 border-green-700' : 'bg-red-900 border-red-700'}`}>
          <p className={`font-medium ${result.new_score > 0 ? 'text-green-300' : 'text-red-300'}`}>
            {result.message}
          </p>
          <p className="text-sm text-gray-300 mt-2">New Score: {result.new_score}</p>
          <button
            onClick={loadSimulation}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors"
          >
            Next Simulation
          </button>
        </div>
      )}
    </div>
  );
};

export default PhishingSimulationCard;
