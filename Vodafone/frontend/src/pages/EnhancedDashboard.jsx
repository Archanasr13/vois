import React, { useState, useEffect } from 'react';
import API from '../services/api';
import RiskProfileBadge from '../components/RiskProfileBadge';
import OrganizationHealthCard from '../components/OrganizationHealthCard';
import PhishingSimulationCard from '../components/PhishingSimulationCard';
import CertificateDownload from '../components/CertificateDownload';

const EnhancedDashboard = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.id) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-300">Unable to load your dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 font-cyber">
          Welcome, {user.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-300">
          Your Cybersecurity Awareness & Training Dashboard
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="glassmorphism rounded-xl p-4 mb-8 max-w-4xl mx-auto">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'phishing', label: '🎣 Phishing Sim' },
            { id: 'risk', label: '⚠️ Risk Profile' },
            { id: 'certificate', label: '🎓 Certificate' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Stats */}
              <div className="glassmorphism rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Score</span>
                    <span className="text-2xl font-bold text-blue-400">{user.score || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Department</span>
                    <span className="text-gray-400">{user.department || 'General'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Member Since</span>
                    <span className="text-gray-400">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</span>
                  </div>
                </div>
              </div>

              {/* Risk Profile */}
              <div className="glassmorphism rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">Your Risk Profile</h3>
                <RiskProfileBadge user={user} />
              </div>
            </div>

            {/* Organization Health */}
            <div className="glassmorphism rounded-xl p-6">
              <OrganizationHealthCard />
            </div>
          </div>
        )}

        {/* Phishing Tab */}
        {activeTab === 'phishing' && (
          <div className="space-y-6">
            <div className="text-gray-300 mb-4">
              Test your phishing detection skills with realistic email simulations.
              <br />
              Click the link if you think it's safe, or ignore if it looks suspicious.
            </div>
            <PhishingSimulationCard user={user} />
          </div>
        )}

        {/* Risk Profile Tab */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="glassmorphism rounded-xl p-6">
              <h3 className="font-semibold text-white mb-6">Your Cyber Risk Analysis</h3>
              <RiskProfileBadge user={user} />
              <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-300">
                  <strong>Risk Score Explanation:</strong>
                  <br />
                  • Your risk is calculated based on phishing clicks (40%), quiz mistakes (30%), and failed simulations (30%).
                  <br />
                  • Lower scores are better. Aim to stay in the "Low" risk category by:
                </p>
                <ul className="text-sm text-gray-300 mt-3 ml-4 space-y-1">
                  <li>✓ Avoiding phishing emails</li>
                  <li>✓ Scoring high on quizzes</li>
                  <li>✓ Successfully identifying suspicious activities</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Tab */}
        {activeTab === 'certificate' && (
          <div className="space-y-6">
            <CertificateDownload user={user} />
            <div className="glassmorphism rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">Certificate Requirements</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>✓ Complete at least 1 quiz</li>
                <li>✓ Complete at least 3 phishing simulations</li>
                <li>✓ Maintain awareness throughout the training</li>
              </ul>
              <p className="text-xs text-gray-400 mt-4">
                Once you meet the requirements, download your certificate to showcase your cybersecurity awareness.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboard;
