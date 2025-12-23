import React from 'react';

const AiReportCard = ({ report, onExpand }) => {
  if (!report) return null;
  return (
    <div className="bg-white/5 rounded p-4">
      <h3 className="text-white font-semibold">AI Executive Summary</h3>
      <p className="text-gray-300 mt-2">{report.report_text}</p>
      <button onClick={onExpand} className="mt-3 px-3 py-1 bg-blue-600 rounded text-white text-sm">Show Metrics</button>
    </div>
  );
};

export default AiReportCard;
