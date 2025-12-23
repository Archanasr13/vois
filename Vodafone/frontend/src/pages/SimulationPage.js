import React, { useState, useEffect } from 'react';
import SimulationCard from '../components/SimulationCard';
import ResultModal from '../components/ResultModal';
import AwarenessVideo from '../components/AwarenessVideo';
import api from '../services/api';
import axios from 'axios';

const SimulationPage = ({ user }) => {
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAwarenessVideo, setShowAwarenessVideo] = useState(false);
  const [awarenessScript, setAwarenessScript] = useState(null);

  useEffect(() => {
    fetchSimulation();
  }, []);

  const fetchSimulation = async () => {
    try {
      const params = { user_id: user?.id };
      const data = await api.getPhishingSimulation(params);
      setSimulation(data);
    } catch (error) {
      console.error('Error fetching simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    const clicked = action !== 'safe';
    const payload = {
      user_id: user?.id || 1,
      simulation_id: simulation?.id,
      clicked,
    };
    console.log('[SimulationPage] submitting interaction payload:', payload);
    setSubmitting(true);
    try {
      const res = await api.trackPhishingClick(payload);
      console.log('[SimulationPage] /api/phishing/click response:', res);

      const isCorrect = res.success === true && !clicked;

      setResult({
        isCorrect,
        isSafe: !clicked,
        score: res.new_score,
        message: res.message,
      });

      // Show result modal FIRST
      setShowResult(true);

      // Generate awareness video for BOTH correct and incorrect responses
      // Video will play AFTER user closes the modal
      await generateAwarenessVideo(
        'phishing',
        isCorrect ? 'correct_identification' : (clicked ? 'clicked_link' : 'marked_safe_as_unsafe')
      );
    } catch (error) {
      console.error('Error submitting interaction:', error);
      setResult({
        isCorrect: false,
        isSafe: !clicked,
        score: null,
        message: (error && error.message) || 'Failed to submit interaction',
      });
      setShowResult(true);
      // Generate fallback video even on error
      await generateAwarenessVideo('general', 'error');
    } finally {
      setSubmitting(false);
    }
  };


  const generateAwarenessVideo = async (simulationType, userAction) => {
    try {
      const response = await axios.post('http://localhost:5000/api/ai/awareness', {
        user_id: user?.id || 1,
        simulation_type: simulationType,
        user_action: userAction,
        difficulty: simulation?.difficulty || 'medium',
        user_name: user?.name
      });

      if (response.data.success) {
        setAwarenessScript(response.data.script_text);
      }
    } catch (error) {
      console.error('Error generating awareness video:', error);
      // Fallback script based on whether user was correct or not
      const isCorrect = userAction === 'correct_identification';
      if (isCorrect) {
        setAwarenessScript(
          "Excellent work! You correctly identified this email. " +
          "Your cybersecurity awareness is strong. " +
          "Keep practicing to stay sharp against evolving threats. " +
          "Remember: always verify before you trust!"
        );
      } else {
        setAwarenessScript(
          "I noticed you made a security mistake in that simulation. " +
          "Cybersecurity threats can catch anyone off guard. " +
          "Always verify before you trust, and report suspicious activity immediately. " +
          "Stay alert and stay secure!"
        );
      }
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);

    // Show awareness video after closing result modal
    if (awarenessScript) {
      setShowAwarenessVideo(true);
    } else {
      // If no script generated, just load new simulation
      setResult(null);
      fetchSimulation();
    }
  };

  const handleVideoComplete = () => {
    setShowAwarenessVideo(false);
    setAwarenessScript(null);
    setResult(null);
    fetchSimulation(); // Load new simulation
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading simulation...</p>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Simulation</h2>
          <p className="text-gray-300 mb-4">Unable to load the simulation. Please try again.</p>
          <button
            onClick={fetchSimulation}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 font-cyber">
          Phishing Simulation
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          You've received the following email. Based on your cybersecurity training,
          decide whether this is safe or unsafe to interact with.
        </p>
      </div>

      <SimulationCard
        simulation={simulation}
        onAction={handleAction}
      />

      <div className="mt-8 text-center">
        <div className="glassmorphism rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Tips for Identifying Phishing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <strong className="text-red-400">Red Flags:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Urgent language demanding immediate action</li>
                <li>• Suspicious sender email addresses</li>
                <li>• Requests for personal information</li>
                <li>• Poor grammar and spelling</li>
              </ul>
            </div>
            <div>
              <strong className="text-green-400">Safe Practices:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Verify sender through official channels</li>
                <li>• Hover over links before clicking</li>
                <li>• Report suspicious emails to IT</li>
                <li>• When in doubt, don't click</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ResultModal
        isOpen={showResult}
        onClose={handleCloseResult}
        result={result}
        type="simulation"
      />

      {/* AI Awareness Video - shown after user closes result modal */}
      {showAwarenessVideo && awarenessScript && (
        <AwarenessVideo
          script={awarenessScript}
          onComplete={handleVideoComplete}
          isVisible={showAwarenessVideo}
        />
      )}
    </div>
  );
};

export default SimulationPage;
