import React, { useState, useEffect } from 'react';

const ThreatIntelligence = () => {
    const [threats, setThreats] = useState([]);
    const [filter, setFilter] = useState('all'); // all, critical, high, medium, low
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchThreats();
        // Simulate real-time updates
        const interval = setInterval(() => {
            addNewThreat();
        }, 15000); // Add new threat every 15 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchThreats = () => {
        const mockThreats = [
            {
                id: 1,
                title: 'New Phishing Campaign Targeting Financial Sector',
                description: 'Attackers are impersonating major banks to steal credentials. Be cautious of emails requesting urgent account verification.',
                severity: 'critical',
                category: 'Phishing',
                timestamp: new Date(Date.now() - 1000 * 60 * 5),
                source: 'CISA',
                affected: 'Finance, Banking',
                indicators: ['suspicious-bank-email.com', '192.168.1.100']
            },
            {
                id: 2,
                title: 'Ransomware Variant "DarkCrypt" Spreading Rapidly',
                description: 'New ransomware targeting healthcare and education sectors. Ensure all systems are patched and backups are current.',
                severity: 'critical',
                category: 'Ransomware',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                source: 'FBI Cyber Division',
                affected: 'Healthcare, Education',
                indicators: ['darkcrypt.exe', 'C2: 45.67.89.123']
            },
            {
                id: 3,
                title: 'Microsoft Exchange Zero-Day Vulnerability Discovered',
                description: 'Critical vulnerability in Exchange Server allows remote code execution. Patch immediately.',
                severity: 'critical',
                category: 'Vulnerability',
                timestamp: new Date(Date.now() - 1000 * 60 * 60),
                source: 'Microsoft Security',
                affected: 'All Organizations',
                indicators: ['CVE-2024-XXXXX']
            },
            {
                id: 4,
                title: 'Spear Phishing Campaign Using AI-Generated Content',
                description: 'Sophisticated phishing emails using AI to create convincing fake messages from executives.',
                severity: 'high',
                category: 'Phishing',
                timestamp: new Date(Date.now() - 1000 * 60 * 90),
                source: 'Cybersecurity & Infrastructure Security Agency',
                affected: 'Corporate Executives',
                indicators: ['deepfake-voice.mp3', 'ai-generated-email.txt']
            },
            {
                id: 5,
                title: 'Supply Chain Attack on Popular NPM Package',
                description: 'Malicious code injected into widely-used JavaScript library. Check your dependencies.',
                severity: 'high',
                category: 'Supply Chain',
                timestamp: new Date(Date.now() - 1000 * 60 * 120),
                source: 'npm Security Team',
                affected: 'Software Developers',
                indicators: ['malicious-package@1.2.3']
            },
            {
                id: 6,
                title: 'Credential Stuffing Attacks on E-commerce Sites',
                description: 'Automated attacks using leaked credentials to access user accounts. Enable 2FA.',
                severity: 'medium',
                category: 'Account Takeover',
                timestamp: new Date(Date.now() - 1000 * 60 * 180),
                source: 'Akamai Threat Research',
                affected: 'E-commerce, Retail',
                indicators: ['botnet-ips.txt']
            }
        ];

        setThreats(mockThreats);
        setLoading(false);
    };

    const addNewThreat = () => {
        const newThreats = [
            {
                id: Date.now(),
                title: 'New Malware Variant Detected in Email Attachments',
                description: 'Trojan disguised as PDF invoice. Avoid opening unexpected attachments.',
                severity: 'high',
                category: 'Malware',
                timestamp: new Date(),
                source: 'Symantec Threat Intelligence',
                affected: 'All Users',
                indicators: ['invoice_malware.pdf.exe']
            },
            {
                id: Date.now(),
                title: 'DDoS Attack Targeting Cloud Services',
                description: 'Large-scale distributed denial of service attack affecting multiple cloud providers.',
                severity: 'medium',
                category: 'DDoS',
                timestamp: new Date(),
                source: 'Cloudflare Radar',
                affected: 'Cloud Infrastructure',
                indicators: ['botnet-c2.example.com']
            }
        ];

        const randomThreat = newThreats[Math.floor(Math.random() * newThreats.length)];
        setThreats(prev => [randomThreat, ...prev].slice(0, 20)); // Keep only latest 20
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'from-red-600 to-red-400';
            case 'high':
                return 'from-orange-600 to-orange-400';
            case 'medium':
                return 'from-yellow-600 to-yellow-400';
            case 'low':
                return 'from-blue-600 to-blue-400';
            default:
                return 'from-gray-600 to-gray-400';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical':
                return '🚨';
            case 'high':
                return '⚠️';
            case 'medium':
                return '⚡';
            case 'low':
                return 'ℹ️';
            default:
                return '📌';
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Phishing': '🎣',
            'Ransomware': '🔒',
            'Malware': '🦠',
            'Vulnerability': '🔓',
            'Supply Chain': '⛓️',
            'Account Takeover': '🔑',
            'DDoS': '💥'
        };
        return icons[category] || '🛡️';
    };

    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const filteredThreats = filter === 'all'
        ? threats
        : threats.filter(t => t.severity === filter);

    return (
        <div className="min-h-screen pb-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4 font-cyber">
                    🌐 Threat Intelligence Feed
                </h1>
                <p className="text-gray-300">
                    Real-time cybersecurity threats and vulnerabilities
                </p>
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-600/20 border border-green-600 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-green-400 font-semibold">Live Feed Active</span>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex justify-center mb-8 flex-wrap gap-2">
                {['all', 'critical', 'high', 'medium', 'low'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'glassmorphism text-gray-400 hover:text-white'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f !== 'all' && (
                            <span className="ml-2 px-2 py-1 bg-white/10 rounded text-xs">
                                {threats.filter(t => t.severity === f).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Threat Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-6xl mx-auto">
                <div className="glassmorphism rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">🚨</div>
                    <div className="text-2xl font-bold text-red-400">
                        {threats.filter(t => t.severity === 'critical').length}
                    </div>
                    <div className="text-sm text-gray-400">Critical</div>
                </div>
                <div className="glassmorphism rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">⚠️</div>
                    <div className="text-2xl font-bold text-orange-400">
                        {threats.filter(t => t.severity === 'high').length}
                    </div>
                    <div className="text-sm text-gray-400">High</div>
                </div>
                <div className="glassmorphism rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-2xl font-bold text-yellow-400">
                        {threats.filter(t => t.severity === 'medium').length}
                    </div>
                    <div className="text-sm text-gray-400">Medium</div>
                </div>
                <div className="glassmorphism rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-2xl font-bold text-blue-400">{threats.length}</div>
                    <div className="text-sm text-gray-400">Total</div>
                </div>
            </div>

            {/* Threat Feed */}
            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="glassmorphism rounded-xl p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading threat intelligence...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredThreats.map((threat, index) => (
                            <div
                                key={threat.id}
                                className={`glassmorphism rounded-xl p-6 border-l-4 ${index === 0 ? 'animate-slideIn' : ''
                                    }`}
                                style={{
                                    borderLeftColor: threat.severity === 'critical' ? '#ef4444' :
                                        threat.severity === 'high' ? '#f97316' :
                                            threat.severity === 'medium' ? '#eab308' : '#3b82f6'
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className="text-4xl">{getCategoryIcon(threat.category)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-xl font-bold text-white">{threat.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getSeverityColor(threat.severity)}`}>
                                                    {getSeverityIcon(threat.severity)} {threat.severity.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 mb-3">{threat.description}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                                <div>
                                                    <span className="text-gray-400">Category:</span>
                                                    <span className="text-white font-semibold ml-2">{threat.category}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Affected:</span>
                                                    <span className="text-white font-semibold ml-2">{threat.affected}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Source:</span>
                                                    <span className="text-blue-400 font-semibold ml-2">{threat.source}</span>
                                                </div>
                                            </div>

                                            {threat.indicators && threat.indicators.length > 0 && (
                                                <div className="mt-3">
                                                    <div className="text-gray-400 text-sm mb-2">Indicators of Compromise:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {threat.indicators.map((indicator, idx) => (
                                                            <code key={idx} className="px-3 py-1 bg-gray-800 rounded text-xs text-cyan-400 font-mono">
                                                                {indicator}
                                                            </code>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right ml-4">
                                        <div className="text-sm text-gray-400">{getTimeAgo(threat.timestamp)}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                    <div className="flex space-x-2">
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all">
                                            📖 Read More
                                        </button>
                                        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-all">
                                            🔖 Save
                                        </button>
                                    </div>
                                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all">
                                        ✅ Mark as Reviewed
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThreatIntelligence;
