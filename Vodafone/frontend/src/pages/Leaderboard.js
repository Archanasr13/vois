import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Leaderboard = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
    if (user?.id) {
      fetchUserRank();
    }
  }, [period, user]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/leaderboard/top-users?limit=20&period=${period}`);
      if (response.data.success) {
        setLeaderboard(response.data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/leaderboard/user-rank/${user.id}`);
      if (response.data.success) {
        setUserRank(response.data);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
          🏆 Leaderboard
        </h1>
        <p className="text-gray-300 text-lg">
          See how you rank against other cybersecurity champions
        </p>
      </div>

      {/* User Rank Card */}
      {userRank && (
        <div className="glassmorphism rounded-xl p-6 mb-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-cyan-400">#{userRank.rank}</div>
              <div className="text-gray-400 mt-1">Your Rank</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400">{userRank.score}</div>
              <div className="text-gray-400 mt-1">Your Score</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">Top {userRank.percentile}%</div>
              <div className="text-gray-400 mt-1">Percentile</div>
            </div>
            <div>
              <div className="text-4xl">{userRank.badge.icon}</div>
              <div className="text-gray-400 mt-1">{userRank.badge.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Period Filter */}
      <div className="flex justify-center mb-6 space-x-4">
        {['all', 'month', 'week'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${period === p
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            {p === 'all' ? 'All Time' : p === 'month' ? 'This Month' : 'This Week'}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="glassmorphism rounded-xl p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Top Performers</h2>

        {leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${entry.user_id === user?.id
                    ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-2 border-cyan-500/50'
                    : 'bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  {/* Rank */}
                  <div className={`text-3xl font-bold min-w-[60px] text-center ${entry.rank === 1 ? 'text-yellow-400' :
                      entry.rank === 2 ? 'text-gray-300' :
                        entry.rank === 3 ? 'text-orange-400' :
                          'text-gray-500'
                    }`}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold text-lg">{entry.name}</span>
                      <span className="text-2xl">{entry.badge.icon}</span>
                      {entry.user_id === user?.id && (
                        <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded-full">You</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{entry.department}</div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center space-x-6 text-center">
                    <div>
                      <div className="text-sm text-gray-400">Quizzes</div>
                      <div className="text-white font-semibold">{entry.quiz_count}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Simulations</div>
                      <div className="text-white font-semibold">{entry.simulation_count}</div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right min-w-[80px]">
                    <div className="text-2xl font-bold text-cyan-400">{entry.score}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-xl">No leaderboard data available</p>
            <p className="text-sm mt-2">Complete quizzes and simulations to appear on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
