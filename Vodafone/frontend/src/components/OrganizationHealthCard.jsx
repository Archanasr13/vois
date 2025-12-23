import React, { useState, useEffect } from 'react';
import API from '../services/api';

const OrganizationHealthCard = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    try {
      const data = await API.getOrganizationHealth();
      setHealth(data);
    } catch (err) {
      console.error('Failed to load health score:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !health) {
    return <div className="text-gray-400 text-sm">Loading...</div>;
  }

  const colorMap = {
    green: 'from-green-600 to-green-700',
    yellow: 'from-yellow-600 to-yellow-700',
    red: 'from-red-600 to-red-700',
  };

  const gradient = colorMap[health.color] || 'from-gray-600 to-gray-700';

  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-lg p-6 border border-opacity-30 border-white`}>
      <h3 className="text-lg font-bold text-white mb-4">Organization Cyber Health Score</h3>
      
      <div className="flex items-center justify-between mb-6">
        <div className="text-5xl font-bold text-white">{health.health_score.toFixed(1)}</div>
        <div className="text-right">
          <div className="text-sm text-gray-200">out of 100</div>
          <div className="text-xs text-gray-300 mt-1">{health.summary}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="bg-black bg-opacity-30 rounded p-3">
          <div className="text-gray-300 text-xs">Phishing Avoidance</div>
          <div className="text-white font-semibold text-lg mt-1">{health.phishing_avoidance_rate.toFixed(1)}%</div>
        </div>
        <div className="bg-black bg-opacity-30 rounded p-3">
          <div className="text-gray-300 text-xs">Avg Quiz Score</div>
          <div className="text-white font-semibold text-lg mt-1">{health.avg_quiz_score.toFixed(1)}</div>
        </div>
        <div className="bg-black bg-opacity-30 rounded p-3">
          <div className="text-gray-300 text-xs">Simulation Success</div>
          <div className="text-white font-semibold text-lg mt-1">{health.simulation_success_rate.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationHealthCard;
