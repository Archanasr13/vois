import React, { useState, useEffect } from 'react';
import API from '../services/api';

const RiskProfileBadge = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const data = await API.getUserRiskProfile(user?.id);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load risk profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return <div className="text-gray-400 text-sm">Loading...</div>;
  }

  const colorMap = {
    Low: 'bg-green-900 border-green-700 text-green-300',
    Medium: 'bg-yellow-900 border-yellow-700 text-yellow-300',
    High: 'bg-red-900 border-red-700 text-red-300',
  };

  const color = colorMap[profile.risk_level] || 'bg-gray-900 border-gray-700 text-gray-300';

  return (
    <div className={`border rounded-lg p-3 ${color}`}>
      <div className="font-semibold text-lg">{profile.risk_level} Risk</div>
      <div className="text-xs opacity-75 mt-1">Score: {profile.score.toFixed(1)}/100</div>
      <div className="text-xs mt-2 space-y-1">
        <div>Phishing Clicks: {profile.phishing_clicks}</div>
        <div>Quiz Mistakes: {profile.quiz_mistakes}</div>
        <div>Failed Simulations: {profile.failed_simulations}</div>
      </div>
    </div>
  );
};

export default RiskProfileBadge;
