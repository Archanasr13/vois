import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, CheckCircle, Info } from 'lucide-react';

const SuspiciousScore = ({ score, riskLevel }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 20) return 'text-blue-400';
    return 'text-green-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-red-900/20';
    if (score >= 50) return 'bg-yellow-900/20';
    if (score >= 20) return 'bg-blue-900/20';
    return 'bg-green-900/20';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <AlertTriangle className="h-6 w-6" />;
    if (score >= 50) return <Shield className="h-6 w-6" />;
    if (score >= 20) return <Info className="h-6 w-6" />;
    return <CheckCircle className="h-6 w-6" />;
  };

  const getScoreDescription = (score) => {
    if (score >= 80) return 'High risk - Multiple suspicious indicators detected';
    if (score >= 50) return 'Medium risk - Some suspicious patterns found';
    if (score >= 20) return 'Low risk - Minor anomalies detected';
    return 'Minimal risk - Domain appears legitimate';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6 rounded-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 cyber-border rounded-lg">
            <Shield className="h-6 w-6 cyber-text" />
          </div>
          <div>
            <h3 className="text-xl font-bold cyber-text">Suspicious Score</h3>
            <p className="text-gray-400">Risk assessment based on hosting patterns</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg ${getScoreBg(score)} ${getScoreColor(score)} border`}>
          <span className="font-bold text-lg">{Math.round(score)}/100</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Score Bar */}
        <div className="relative">
          <div className="w-full bg-gray-800 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-3 rounded-full ${
                score >= 80 ? 'bg-red-400' :
                score >= 50 ? 'bg-yellow-400' :
                score >= 20 ? 'bg-blue-400' : 'bg-green-400'
              }`}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Risk Level */}
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getScoreBg(score)} ${getScoreColor(score)}`}>
            {getScoreIcon(score)}
          </div>
          <div>
            <div className={`font-semibold ${getScoreColor(score)}`}>
              {riskLevel.level} RISK
            </div>
            <div className="text-sm text-gray-400">
              {getScoreDescription(score)}
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="space-y-2">
            <h4 className="font-semibold cyber-text">Risk Factors</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyber-blue rounded-full"></div>
                <span className="text-gray-400">CDN Detection</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyber-accent rounded-full"></div>
                <span className="text-gray-400">Hosting Anomalies</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyber-warning rounded-full"></div>
                <span className="text-gray-400">Domain Age</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold cyber-text">Recommendations</h4>
            <div className="space-y-1 text-sm text-gray-400">
              {score >= 80 && (
                <>
                  <div>• Investigate hosting provider</div>
                  <div>• Check for malicious activity</div>
                  <div>• Monitor network traffic</div>
                </>
              )}
              {score >= 50 && score < 80 && (
                <>
                  <div>• Review domain registration</div>
                  <div>• Check SSL certificate</div>
                  <div>• Monitor for changes</div>
                </>
              )}
              {score < 50 && (
                <>
                  <div>• Domain appears legitimate</div>
                  <div>• Continue monitoring</div>
                  <div>• Regular security checks</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SuspiciousScore;



