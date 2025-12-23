import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/get_dashboard_data');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-300 mb-4">Unable to load admin dashboard data.</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboardData();
              fetchUsers();
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data (guard when dashboardData is not yet available)
  const deptLabels = dashboardData && dashboardData.departments ? Object.keys(dashboardData.departments) : [];
  const deptValues = dashboardData && dashboardData.departments ? Object.values(dashboardData.departments).map(dept => dept.avg_score) : [];

  const departmentData = {
    labels: deptLabels,
    datasets: [
      {
        label: 'Average Score',
        data: deptValues,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const interactionData = {
    labels: ['Safe Actions', 'Unsafe Actions'],
    datasets: [
      {
        data: [dashboardData?.interactions?.safe ?? 0, dashboardData?.interactions?.unsafe ?? 0],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Build robust awareness trend data and labels
  const _defaultLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const _trendLabels = Array.isArray(dashboardData?.quiz_stats?.trend_labels) && dashboardData.quiz_stats.trend_labels.length > 0
    ? dashboardData.quiz_stats.trend_labels
    : _defaultLabels;

  const _weeklyRaw = dashboardData?.quiz_stats?.weekly_scores;
  const _avg = Number(dashboardData?.quiz_stats?.average_score ?? 0);

  // Normalize weekly data: use provided, or pad/trim, or fallback
  let _trendData = [];
  if (Array.isArray(_weeklyRaw) && _weeklyRaw.length > 0) {
    _trendData = _weeklyRaw.slice(0, _trendLabels.length).map(v => Number(v));
    while (_trendData.length < _trendLabels.length) _trendData.push(_avg);
  } else {
    // sensible default series (keeps the final value as the current average)
    _trendData = [_avg - 15 || 50, _avg - 5 || 60, _avg + 3 || 70, _avg].slice(0, _trendLabels.length);
    while (_trendData.length < _trendLabels.length) _trendData.push(_avg);
  }

  // Clamp values to 0..100 to avoid chart rendering issues
  _trendData = _trendData.map(n => {
    const v = Number(n) || 0;
    if (v < 0) return 0;
    if (v > 100) return 100;
    return v;
  });

  const awarenessTrendData = {
    labels: _trendLabels,
    datasets: [
      {
        label: 'Average Awareness Score',
        data: _trendData,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },
  };

  return (
    <div className="min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 font-cyber">
          Admin Dashboard
        </h1>
        <p className="text-gray-300">
          Monitor organization-wide cybersecurity training performance and analytics.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glassmorphism rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {dashboardData?.total_users ?? 0}
          </div>
          <div className="text-gray-300">Total Users</div>
        </div>
        
        <div className="glassmorphism rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {dashboardData?.interactions?.total ?? 0}
          </div>
          <div className="text-gray-300">Total Interactions</div>
        </div>
        
        <div className="glassmorphism rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {dashboardData?.quiz_stats?.total_quizzes ?? 0}
          </div>
          <div className="text-gray-300">Quizzes Completed</div>
        </div>
        
        <div className="glassmorphism rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {dashboardData?.quiz_stats?.average_score ?? 0}%
          </div>
          <div className="text-gray-300">Avg Quiz Score</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Department Performance */}
        <div className="glassmorphism rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Department Performance</h3>
          <Bar data={departmentData} options={chartOptions} />
        </div>

        {/* Safe vs Unsafe Interactions */}
        <div className="glassmorphism rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">User Interactions</h3>
          <Doughnut data={interactionData} options={doughnutOptions} />
        </div>
      </div>

      {/* Awareness Trend */}
      <div className="glassmorphism rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Awareness Trend</h3>
        <Line key={JSON.stringify(awarenessTrendData.datasets[0].data)} data={awarenessTrendData} options={chartOptions} />
      </div>

      {/* User Management */}
      <div className="glassmorphism rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">User Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left text-gray-300 py-3">Name</th>
                <th className="text-left text-gray-300 py-3">Department</th>
                <th className="text-left text-gray-300 py-3">Email</th>
                <th className="text-left text-gray-300 py-3">Score</th>
                <th className="text-left text-gray-300 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700">
                  <td className="text-white py-3">{user.name}</td>
                  <td className="text-gray-300 py-3">{user.department}</td>
                  <td className="text-gray-300 py-3">{user.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.score >= 80 ? 'bg-green-600 text-white' :
                      user.score >= 60 ? 'bg-yellow-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {user.score}
                    </span>
                  </td>
                  <td className="text-gray-300 py-3">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;







