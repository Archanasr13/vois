import React, { useState, useEffect } from 'react';
import API from '../services/api';

const UserDashboard = ({ user: propUser }) => {
  const [user, setUser] = useState(propUser);
  const [loading, setLoading] = useState(!propUser);
  const [certificateEligible, setCertificateEligible] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
      setLoading(false);
      checkCertificateEligibility(propUser.id);
      fetchAchievements(propUser.id);
      fetchProgressData(propUser.id);
    } else {
      fetchUserData();
    }
  }, [propUser]);

  const checkCertificateEligibility = async (userId) => {
    try {
      const data = await API.checkCertificateEligibility({ user_id: userId });
      setCertificateEligible(data.eligible);
      setCertificateInfo(data);
    } catch (error) {
      console.error('Error checking certificate eligibility:', error);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!user) return;

    setDownloading(true);
    try {
      const blob = await API.requestCertificate({
        user_id: user.id,
        name: user.name
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${user.name.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/1'); // Demo user (use proxy)
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/leaderboard/achievements/${userId}`);
      const data = await response.json();
      if (data.success) {
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchProgressData = async (userId) => {
    try {
      // Generate mock progress data for the last 7 days
      const today = new Date();
      const mockData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        mockData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: Math.floor(Math.random() * 30) + (user?.score || 70) - 15,
          simulations: Math.floor(Math.random() * 3) + 1,
          quizzes: Math.floor(Math.random() * 2)
        });
      }
      setProgressData(mockData);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLevel = (score) => {
    if (score >= 80) return 'Expert';
    if (score >= 60) return 'Intermediate';
    return 'Beginner';
  };

  const getRecommendations = (score) => {
    if (score >= 80) {
      return [
        'Continue practicing with advanced simulations',
        'Share your knowledge with colleagues',
        'Stay updated with latest cybersecurity trends'
      ];
    } else if (score >= 60) {
      return [
        'Take more phishing simulations',
        'Review cybersecurity best practices',
        'Practice identifying suspicious emails'
      ];
    } else {
      return [
        'Complete basic cybersecurity training',
        'Take the awareness quiz multiple times',
        'Focus on email security fundamentals'
      ];
    }
  };

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
          <p className="text-gray-300 mb-4">Unable to load your dashboard data.</p>
          <button
            onClick={fetchUserData}
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
          Your Dashboard
        </h1>
        <p className="text-gray-300">
          Track your cybersecurity awareness progress and training activities.
        </p>
      </div>

      {/* User Info Card */}
      <div className="glassmorphism rounded-xl p-6 mb-8 max-w-4xl mx-auto">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white font-bold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Department:</span>
                <div className="text-white font-semibold">{user.department}</div>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <div className="text-white font-semibold">{user.email}</div>
              </div>
              <div>
                <span className="text-gray-400">Member Since:</span>
                <div className="text-white font-semibold">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glassmorphism rounded-xl p-6 text-center">
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(user.score)}`}>
            {user.score}
          </div>
          <div className="text-gray-300 mb-2">Awareness Score</div>
          <div className="text-sm text-gray-400">{getScoreLevel(user.score)} Level</div>
        </div>

        <div className="glassmorphism rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-blue-400 mb-2">5</div>
          <div className="text-gray-300 mb-2">Quizzes Completed</div>
          <div className="text-sm text-gray-400">This Month</div>
        </div>

        <div className="glassmorphism rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-green-400 mb-2">12</div>
          <div className="text-gray-300 mb-2">Simulations Completed</div>
          <div className="text-sm text-gray-400">This Month</div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="glassmorphism rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">📈 Progress Over Time</h3>
        {progressData.length > 0 ? (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="relative h-64">
              {/* Simple line chart using SVG */}
              <svg className="w-full h-full" viewBox="0 0 700 250" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 50}
                    x2="700"
                    y2={i * 50}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                ))}

                {/* Score line */}
                <polyline
                  points={progressData.map((d, i) => `${(i / (progressData.length - 1)) * 700},${250 - (d.score / 100) * 250}`).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {progressData.map((d, i) => (
                  <circle
                    key={i}
                    cx={(i / (progressData.length - 1)) * 700}
                    cy={250 - (d.score / 100) * 250}
                    r="5"
                    fill="#3b82f6"
                    className="hover:r-7 transition-all"
                  />
                ))}
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-8">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-4 text-xs text-gray-400">
              {progressData.map((d, i) => (
                <span key={i}>{d.date}</span>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">Awareness Score</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">📈</div>
              <p className="text-gray-400">Loading progress data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="glassmorphism rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Recommendations</h3>
        <div className="space-y-3">
          {getRecommendations(user.score).map((rec, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Section */}
      <div className="glassmorphism rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">🏆 Completion Certificate</h3>
          {certificateEligible && (
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
              Eligible
            </span>
          )}
        </div>

        {certificateEligible ? (
          <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-lg p-6">
            <p className="text-white mb-4">
              Congratulations! You've completed all required training modules. Download your certificate of completion.
            </p>
            <button
              onClick={handleDownloadCertificate}
              disabled={downloading}
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100"
            >
              {downloading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </span>
              ) : (
                '📄 Download Certificate (PDF)'
              )}
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-300 mb-4">
              Complete your training to earn a certificate! You need:
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <span className="mr-2">
                  {certificateInfo?.quiz_count >= (certificateInfo?.required_quizzes || 1) ? '✅' : '⏳'}
                </span>
                {certificateInfo?.required_quizzes || 1} Quiz(zes) - {certificateInfo?.quiz_count || 0} completed
              </li>
              <li className="flex items-center">
                <span className="mr-2">
                  {certificateInfo?.simulation_count >= (certificateInfo?.required_simulations || 3) ? '✅' : '⏳'}
                </span>
                {certificateInfo?.required_simulations || 3} Simulation(s) - {certificateInfo?.simulation_count || 0} completed
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <div className="glassmorphism rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">🏅 Your Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-lg p-4 text-center border border-yellow-500/30 hover:border-yellow-400/50 transition-all">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="text-white font-semibold text-sm mb-1">{achievement.name}</div>
                <div className="text-gray-400 text-xs">{achievement.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links to Other Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <a
          href="/leaderboard"
          className="glassmorphism rounded-xl p-6 hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">🏆 Leaderboard</h3>
            <span className="text-blue-400">→</span>
          </div>
          <p className="text-gray-300 text-sm">
            See how you rank against other cybersecurity champions
          </p>
        </a>

        <a
          href="/threats"
          className="glassmorphism rounded-xl p-6 hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">⚠️ Threat Intelligence</h3>
            <span className="text-blue-400">→</span>
          </div>
          <p className="text-gray-300 text-sm">
            View real-time cybersecurity threats and vulnerabilities
          </p>
        </a>
      </div>

      {/* Quick Actions */}
      <div className="glassmorphism rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/simulation"
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-center transition-all duration-200"
          >
            🎯 Take New Simulation
          </a>
          <a
            href="/quiz"
            className="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold text-center transition-all duration-200"
          >
            📝 Retake Quiz
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
