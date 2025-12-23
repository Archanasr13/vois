import React, { useState } from 'react';
import api from '../services/api';
import AiReportCard from '../components/AiReportCard';
import { Line } from 'react-chartjs-2';

const AdminAIDashboard = () => {
  const [report, setReport] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const generate = async (period='30d') => {
    try {
      const res = await api.getAIReport({ period });
      setReport({ report_text: res.report_text });
      setMetrics(res.metrics);
    } catch (e) {
      console.error(e);
      setReport(null);
      setMetrics(null);
    }
  };

  return (
    <div>
      <h2 className="text-3xl text-white font-bold mb-4">AI Reports</h2>
      <div className="flex gap-2 mb-4">
        <button onClick={() => generate('7d')} className="px-3 py-1 bg-gray-700 rounded">7 days</button>
        <button onClick={() => generate('30d')} className="px-3 py-1 bg-gray-700 rounded">30 days</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <AiReportCard report={report} onExpand={() => {}} />
        <div className="bg-white/5 rounded p-4">
          <h3 className="text-white font-semibold">Metrics</h3>
          {metrics ? (
            <div className="text-gray-300">
              <div>Total interactions: {metrics.total_interactions}</div>
              <div>Phishing clicks: {metrics.phishing_clicks}</div>
              <div>Avg quiz score: {metrics.avg_quiz_score}</div>
            </div>
          ) : (
            <div className="text-gray-400">No metrics</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAIDashboard;
