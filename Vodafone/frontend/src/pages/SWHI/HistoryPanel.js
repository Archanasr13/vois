import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Globe, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const HistoryPanel = ({ history, onClose, onSelectDomain }) => {
  const getRiskIcon = (score) => {
    if (score >= 80) return <AlertTriangle className="h-4 w-4 text-red-400" />;
    if (score >= 50) return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    if (score >= 20) return <Shield className="h-4 w-4 text-blue-400" />;
    return <CheckCircle className="h-4 w-4 text-green-400" />;
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 20) return 'text-blue-400';
    return 'text-green-400';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="cyber-card p-6 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 cyber-border rounded-lg">
                <Clock className="h-6 w-6 cyber-text" />
              </div>
              <div>
                <h3 className="text-xl font-bold cyber-text">Analysis History</h3>
                <p className="text-gray-400">{history.length} previous analyses</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* History List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="cyber-text font-semibold">No Analysis History</div>
                <div className="text-gray-400 text-sm mt-2">Start by analyzing a domain</div>
              </div>
            ) : (
              history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="cyber-border p-4 rounded-lg hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => onSelectDomain(item.domain)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRiskIcon(item.suspicious_score)}
                        <div>
                          <div className="cyber-text font-semibold">{item.domain}</div>
                          <div className="text-sm text-gray-400">
                            {item.country && item.city 
                              ? `${item.city}, ${item.country}` 
                              : item.real_ip || 'Unknown location'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`font-semibold ${getRiskColor(item.suspicious_score)}`}>
                          {Math.round(item.suspicious_score)}/100
                        </div>
                        <div className="text-xs text-gray-400">Risk Score</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm cyber-text">{formatDate(item.timestamp)}</div>
                        <div className="text-xs text-gray-400">Analyzed</div>
                      </div>
                      
                      {item.is_cdn_detected && (
                        <div className="px-2 py-1 bg-yellow-900/20 text-yellow-400 rounded text-xs">
                          CDN
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <div className="text-gray-400">IP Address</div>
                        <div className="cyber-text font-mono">{item.real_ip || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">ASN</div>
                        <div className="cyber-text">{item.asn || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Provider</div>
                        <div className="cyber-text">{item.hosting_provider || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">CDN</div>
                        <div className="cyber-text">{item.cdn_provider || 'None'}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div>
                Showing {history.length} of {history.length} analyses
              </div>
              <div>
                Click any item to re-analyze
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HistoryPanel;



