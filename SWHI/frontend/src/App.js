import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Shield, Server, Cloud, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import DomainInput from './components/DomainInput';
import HostingInfo from './components/HostingInfo';
import DNSAnalysis from './components/DNSAnalysis';
import SSLAnalysis from './components/SSLAnalysis';
import NetworkPath from './components/NetworkPath';
import SuspiciousScore from './components/SuspiciousScore';
import WorldMap from './components/WorldMap';
import HistoryPanel from './components/HistoryPanel';
import PDFExport from './components/PDFExport';
import MLPrediction from './components/MLPrediction';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [domain, setDomain] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load analysis history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const analyzeDomain = async (domainToAnalyze) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domainToAnalyze }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data);
      setDomain(domainToAnalyze);

      // Reload history to include new analysis
      loadHistory();
    } catch (err) {
      setError(err.message);
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'HIGH', color: 'text-red-400', bg: 'bg-red-900/20' };
    if (score >= 50) return { level: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
    if (score >= 20) return { level: 'LOW', color: 'text-blue-400', bg: 'bg-blue-900/20' };
    return { level: 'MINIMAL', color: 'text-green-400', bg: 'bg-green-900/20' };
  };

  return (
    <div className="min-h-screen cyber-bg">
      {/* Matrix-style background effect */}
      <div className="matrix-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-dark via-cyber-gray to-cyber-dark"></div>
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 cyber-border rounded-lg cyber-glow">
                <Shield className="h-8 w-8 cyber-text" />
              </div>
              <div>
                <h1 className="text-3xl font-bold cyber-text">Suspicious Domain Hosting Identifier</h1>
                <p className="text-gray-400">Uncover the real infrastructure behind suspicious websites</p>
              </div>
            </motion.div>

            <motion.button
              onClick={() => setShowHistory(!showHistory)}
              className="cyber-card px-4 py-2 rounded-lg hover:cyber-glow transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Server className="h-5 w-5 cyber-text mr-2 inline" />
              History
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        {/* Domain Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <DomainInput
            onAnalyze={analyzeDomain}
            loading={loading}
            domain={domain}
            setDomain={setDomain}
          />
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="cyber-card p-8 rounded-xl text-center mb-8"
            >
              <div className="cyber-loader relative p-6 rounded-lg">
                <Loader2 className="h-12 w-12 cyber-text mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold cyber-text mb-2">Analyzing Domain</h3>
                <p className="text-gray-400">Performing comprehensive security analysis...</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <Globe className="h-4 w-4" />
                    <span>DNS Resolution</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span>SSL Certificate Analysis</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <Cloud className="h-4 w-4" />
                    <span>CDN Detection</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="cyber-card p-6 rounded-xl mb-8 border-red-500/50"
            >
              <div className="flex items-center space-x-3">
                <XCircle className="h-6 w-6 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold text-red-400">Analysis Failed</h3>
                  <p className="text-gray-400">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              {/* Suspicious Score */}
              <SuspiciousScore
                score={analysis.combined_score || analysis.suspicious_score || 0}
                riskLevel={getRiskLevel(analysis.combined_score || analysis.suspicious_score || 0)}
              />

              {/* ML Prediction */}
              {analysis.ml_prediction && analysis.ml_prediction.ml_available && (
                <MLPrediction mlData={analysis.ml_prediction} />
              )}

              {/* Main Analysis Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hosting Information */}
                <HostingInfo analysis={analysis} />

                {/* DNS Analysis */}
                <DNSAnalysis analysis={analysis} />
              </div>

              {/* SSL Analysis */}
              <SSLAnalysis analysis={analysis} />

              {/* Network Path */}
              <NetworkPath analysis={analysis} />

              {/* World Map */}
              {analysis.ip_info?.geolocation && (
                <WorldMap
                  lat={analysis.ip_info.geolocation.latitude}
                  lng={analysis.ip_info.geolocation.longitude}
                  country={analysis.ip_info.geolocation.country}
                  city={analysis.ip_info.geolocation.city}
                />
              )}

              {/* PDF Export */}
              <PDFExport analysis={analysis} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <HistoryPanel
            history={history}
            onClose={() => setShowHistory(false)}
            onSelectDomain={(domain) => {
              setDomain(domain);
              analyzeDomain(domain);
              setShowHistory(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 mt-16 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            Suspicious Domain Hosting Identifier - Cybersecurity Analysis Tool
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Built with React, Flask, and advanced OSINT techniques
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
