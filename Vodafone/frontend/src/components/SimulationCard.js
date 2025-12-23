import React from 'react';

const SimulationCard = ({ simulation, onAction }) => {
  if (!simulation) {
    return (
      <div className="glassmorphism rounded-xl p-6 max-w-4xl mx-auto text-center">
        <p className="text-red-400">Unable to load simulation. Please try again.</p>
      </div>
    );
  }

  const handleSafeAction = () => {
    onAction('safe');
  };

  const handleUnsafeAction = () => {
    onAction('unsafe');
  };

  // Support both old format (email_template string) and new format (email object with fields)
  const isNewFormat = simulation.subject && simulation.body;
  const emailBody = isNewFormat ? simulation.body : simulation.email_template;
  const subject = isNewFormat ? simulation.subject : 'Phishing Simulation';
  const sender = isNewFormat ? simulation.sender : 'unknown@example.com';

  return (
    <div className="glassmorphism rounded-xl p-6 max-w-4xl mx-auto">
      {/* Email Header */}
      <div className="mb-4 border-b border-gray-700 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Difficulty: <span className="text-yellow-400 font-semibold">{simulation.difficulty}</span></span>
          <span className="text-sm text-gray-400">ID: {simulation.id}</span>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-500 mb-2">From: <span className="text-blue-400">{sender}</span></div>
          <div className="text-sm font-semibold text-white">Subject: {subject}</div>
        </div>
      </div>

      {/* Email Body */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 mb-4 max-h-96 overflow-y-auto">
        <div className="text-gray-200 whitespace-pre-wrap font-mono text-sm leading-relaxed break-words">
          {emailBody}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSafeAction}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
        >
          ✅ Safe Action (Ignore/Report)
        </button>
        <button
          onClick={handleUnsafeAction}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
        >
          ⚠️ Unsafe Action (Click/Respond)
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-gray-400 text-sm">
          Choose your action based on what you would do in a real situation
        </p>
      </div>
    </div>
  );
};

export default SimulationCard;


