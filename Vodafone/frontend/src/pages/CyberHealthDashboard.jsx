import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CyberHealthDashboard = () => {
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHealthReport();
    }, []);

    const fetchHealthReport = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/cyber-health/report');
            setHealthData(response.data);
        } catch (error) {
            console.error('Error fetching health report:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-4"></div>
                    <p className="text-white text-xl">Generating AI Insights...</p>
                </div>
            </div>
        );
    }

    if (!healthData) {
        return (
            <div className="text-center text-white">
                <p>Unable to load health report. Please try again.</p>
            </div>
        );
    }

    const { health_score, metrics, insights, recommendations, departments, trends } = healthData;

    // Determine health score color
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return 'from-green-500 to-emerald-600';
        if (score >= 60) return 'from-yellow-500 to-orange-600';
        return 'from-red-500 to-rose-600';
    };

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
                    🛡️ Organization Cyber Health Score
                </h1>
                <p className="text-gray-300 text-lg">AI-Generated Security Insights & Analytics</p>
            </div>

            {/* Main Health Score Card */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="glassmorphism rounded-3xl p-8 text-center relative overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 opacity-10">
                        <div className={`absolute inset-0 bg-gradient-to-br ${getScoreGradient(health_score)} animate-pulse`}></div>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-2xl font-semibold text-white mb-6">Overall Cyber Health Score</h2>

                        {/* Circular Progress */}
                        <div className="relative inline-block">
                            <svg className="transform -rotate-90" width="250" height="250">
                                <circle
                                    cx="125"
                                    cy="125"
                                    r="110"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="20"
                                    fill="none"
                                />
                                <circle
                                    cx="125"
                                    cy="125"
                                    r="110"
                                    stroke="url(#gradient)"
                                    strokeWidth="20"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 110}`}
                                    strokeDashoffset={`${2 * Math.PI * 110 * (1 - health_score / 100)}`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" className={health_score >= 80 ? 'stop-green-400' : health_score >= 60 ? 'stop-yellow-400' : 'stop-red-400'} />
                                        <stop offset="100%" className={health_score >= 80 ? 'stop-emerald-600' : health_score >= 60 ? 'stop-orange-600' : 'stop-rose-600'} />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div>
                                    <div className={`text-7xl font-bold ${getScoreColor(health_score)}`}>
                                        {health_score}
                                    </div>
                                    <div className="text-gray-400 text-xl">/ 100</div>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-300 mt-6 text-lg">
                            Generated on {new Date(healthData.generated_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glassmorphism rounded-xl p-6 text-center">
                        <div className="text-4xl mb-2">👥</div>
                        <div className="text-3xl font-bold text-cyan-400">{metrics.total_users}</div>
                        <div className="text-gray-400 mt-1">Total Users</div>
                    </div>

                    <div className="glassmorphism rounded-xl p-6 text-center">
                        <div className="text-4xl mb-2">🎯</div>
                        <div className="text-3xl font-bold text-green-400">{metrics.safe_actions}</div>
                        <div className="text-gray-400 mt-1">Safe Actions</div>
                    </div>

                    <div className="glassmorphism rounded-xl p-6 text-center">
                        <div className="text-4xl mb-2">⚠️</div>
                        <div className="text-3xl font-bold text-red-400">{metrics.unsafe_actions}</div>
                        <div className="text-gray-400 mt-1">Unsafe Actions</div>
                    </div>

                    <div className="glassmorphism rounded-xl p-6 text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <div className="text-3xl font-bold text-yellow-400">{metrics.avg_quiz_score.toFixed(1)}%</div>
                        <div className="text-gray-400 mt-1">Avg Quiz Score</div>
                    </div>
                </div>
            </div>

            {/* AI-Generated Insights */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="glassmorphism rounded-2xl p-8">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="text-4xl">🤖</span>
                        AI-Generated Insights
                    </h2>

                    <div className="space-y-4">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-5 border border-blue-500/30 hover:border-blue-400/50 transition-all"
                            >
                                <p className="text-gray-200 text-lg leading-relaxed">{insight}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Department Performance */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="glassmorphism rounded-2xl p-8">
                    <h2 className="text-3xl font-bold text-white mb-6">🏢 Department Performance</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map((dept, index) => (
                            <div
                                key={index}
                                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-white">{dept.name}</h3>
                                    {index === 0 && <span className="text-2xl">🏆</span>}
                                    {index === departments.length - 1 && departments.length > 1 && <span className="text-2xl">📚</span>}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Users:</span>
                                        <span className="text-white font-semibold">{dept.users}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Click Rate:</span>
                                        <span className={`font-semibold ${dept.click_rate < 20 ? 'text-green-400' : dept.click_rate < 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {dept.click_rate}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Avg Score:</span>
                                        <span className="text-cyan-400 font-semibold">{dept.avg_score}</span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-1000 ${dept.click_rate < 20 ? 'bg-green-500' : dept.click_rate < 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${100 - dept.click_rate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="glassmorphism rounded-2xl p-8">
                    <h2 className="text-3xl font-bold text-white mb-6">💡 Actionable Recommendations</h2>

                    <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className={`rounded-xl p-6 border-l-4 ${rec.priority === 'high' ? 'bg-red-900/20 border-red-500' :
                                    rec.priority === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                                        'bg-blue-900/20 border-blue-500'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rec.priority === 'high' ? 'bg-red-500 text-white' :
                                                rec.priority === 'medium' ? 'bg-yellow-500 text-black' :
                                                    'bg-blue-500 text-white'
                                                }`}>
                                                {rec.priority.toUpperCase()}
                                            </span>
                                            <h3 className="text-xl font-semibold text-white">{rec.title}</h3>
                                        </div>
                                        <p className="text-gray-300 mb-3">{rec.description}</p>
                                        <p className="text-sm text-cyan-400 mt-2 font-medium">
                                            {rec.action}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Export Button */}
            <div className="max-w-7xl mx-auto text-center">
                <button
                    onClick={async () => {
                        try {
                            const response = await axios.get('http://localhost:5000/api/cyber-health/export-report', {
                                responseType: 'blob',
                            });
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `cyber_health_report_${new Date().toISOString().split('T')[0]}.pdf`);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        } catch (error) {
                            console.error('Error exporting report:', error);
                            alert('Failed to export report. Please try again.');
                        }
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                    📄 Export Report for Leadership
                </button>
            </div>
        </div>
    );
};

export default CyberHealthDashboard;
