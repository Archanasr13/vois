import React, { useEffect, useState } from 'react';
import api from '../services/api';

const DashboardPhase2 = ({ user }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getBehaviorAnalytics();
        setMetrics(data);
      } catch (e) {
        setMetrics(null);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="text-3xl text-white font-bold mb-4">Phase-2 Dashboard</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded p-4">
          <h3 className="text-white font-semibold mb-2">Behavior Analytics</h3>
          {metrics ? (
            <div className="text-gray-300">
              <div>Total interactions: {metrics.total_clicks}</div>
              <div>Correct responses: {metrics.correct}</div>
              <div>Unsafe actions: {metrics.unsafe}</div>
            </div>
          ) : (
            <div className="text-gray-400">Unable to load metrics.</div>
          )}
        </div>

        <div className="bg-white/5 rounded p-4">
          <h3 className="text-white font-semibold mb-2">Quick Links</h3>
          <ul className="text-gray-300">
            <li>- AI Coach</li>
            <li>- Role-based Simulations</li>
            <li>- Incident Response</li>
            <li>- Leaderboard</li>
            <li>- Threat Feed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPhase2;
