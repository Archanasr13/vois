import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ThreatFeed = () => {
  const [threats, setThreats] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchThreats();
    fetchStats();
  }, []);

  const fetchThreats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/threats/feed');
      if (response.data.success) {
        setThreats(response.data.threats);
      }
    } catch (error) {
      console.error('Error fetching threats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/threats/stats');
      if (response.data.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching threat stats:', error);
    }
  };

  const filteredThreats = selectedCategory === 'all'
    ? threats
    : threats.filter(t => t.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-white">Loading real-time threat intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 mb-4">
          🌐 Real-Time Threat Intelligence
        </h1>
        <p className="text-gray-300 text-lg">
          Live feed from CISA and global cybersecurity sources
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glassmorphism rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-red-400">{stats.severity_stats.critical || 0}</div>
            <div className="text-gray-400 mt-1">Critical</div>
          </div>
          <div className="glassmorphism rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-orange-400">{stats.severity_stats.high || 0}</div>
            <div className="text-gray-400 mt-1">High</div>
          </div>
          <div className="glassmorphism rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-yellow-400">{stats.severity_stats.medium || 0}</div>
            <div className="text-gray-400 mt-1">Medium</div>
          </div>
          <div className="glassmorphism rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-blue-400">{stats.severity_stats.low || 0}</div>
            <div className="text-gray-400 mt-1">Low</div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="glassmorphism rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedCategory === 'all'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            All Threats
          </button>
          {stats && Object.entries(stats.category_stats).map(([category, info]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${selectedCategory === category
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <span>{info.icon}</span>
              <span>{info.name}</span>
              <span className="text-xs bg-gray-900 px-2 py-1 rounded-full">{info.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Threat Feed */}
      <div className="glassmorphism rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Active Threats</h2>

        {filteredThreats.length > 0 ? (
          <div className="space-y-4">
            {filteredThreats.map((threat) => (
              <div
                key={threat.id}
                className={`rounded-lg p-5 border-l-4 transition-all hover:shadow-lg ${threat.severity === 'critical' ? 'bg-red-900/20 border-red-500' :
                  threat.severity === 'high' ? 'bg-orange-900/20 border-orange-500' :
                    threat.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                      'bg-blue-900/20 border-blue-500'
                  }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{threat.category_icon}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded text-xs font-bold ${threat.severity === 'critical' ? 'bg-red-500 text-white' :
                          threat.severity === 'high' ? 'bg-orange-500 text-white' :
                            threat.severity === 'medium' ? 'bg-yellow-500 text-black' :
                              'bg-blue-500 text-white'
                          }`}>
                          {threat.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">{threat.time_ago}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{threat.category_name}</div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2">{threat.title}</h3>

                {/* Description */}
                <p className="text-gray-300 mb-4">{threat.description}</p>

                {/* Indicators */}
                {threat.indicators && threat.indicators.length > 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-3">
                    <div className="text-sm font-semibold text-red-400 mb-2">⚠️ Indicators of Compromise:</div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {threat.indicators.map((indicator, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2 text-red-400">•</span>
                          <span>{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mitigation */}
                {threat.mitigation && (
                  <div className="bg-green-900/20 rounded-lg p-4 mb-4">
                    <div className="text-sm font-semibold text-green-400 mb-2">✓ Recommended Actions:</div>
                    <p className="text-sm text-gray-300">{threat.mitigation}</p>
                  </div>
                )}

                {/* Source Link */}
                {threat.source_link && (
                  <div className="text-right">
                    <a
                      href={threat.source_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center justify-end gap-1"
                    >
                      Read Full Report ↗
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🛡️</div>
            <p className="text-xl">No threats in this category</p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <p className="mt-2">Stay vigilant and report any suspicious activity to your IT security team.</p>
      </div>
    </div>
  );
};

export default ThreatFeed;
