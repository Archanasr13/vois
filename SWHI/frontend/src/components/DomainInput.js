import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, AlertTriangle } from 'lucide-react';

const DomainInput = ({ onAnalyze, loading, domain, setDomain }) => {
  const [inputValue, setInputValue] = useState(domain || '');
  const [isValid, setIsValid] = useState(true);

  const validateDomain = (domain) => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    return domainRegex.test(domain);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanDomain = inputValue.trim().toLowerCase();
    
    if (!cleanDomain) {
      setIsValid(false);
      return;
    }

    if (!validateDomain(cleanDomain)) {
      setIsValid(false);
      return;
    }

    setIsValid(true);
    setDomain(cleanDomain);
    onAnalyze(cleanDomain);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsValid(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-8 rounded-xl"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 cyber-border rounded-full mb-4 cyber-glow"
        >
          <Globe className="h-8 w-8 cyber-text" />
        </motion.div>
        <h2 className="text-2xl font-bold cyber-text mb-2">Domain Analysis</h2>
        <p className="text-gray-400">Enter a domain to analyze its hosting infrastructure</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 cyber-text" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="example.com"
            className={`w-full pl-12 pr-4 py-4 cyber-input rounded-lg text-lg transition-all duration-300 ${
              !isValid ? 'border-red-500 focus:border-red-500' : ''
            }`}
            disabled={loading}
          />
          {!isValid && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
            >
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </motion.div>
          )}
        </div>

        {!isValid && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm flex items-center"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Please enter a valid domain name
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="w-full py-4 px-6 cyber-text bg-gradient-to-r from-cyber-blue/20 to-cyber-accent/20 cyber-border rounded-lg font-semibold text-lg transition-all duration-300 hover:cyber-glow disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            'Analyze Domain'
          )}
        </motion.button>
      </form>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-cyber-blue rounded-full"></div>
          <span>DNS Analysis</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-cyber-accent rounded-full"></div>
          <span>SSL Inspection</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-cyber-warning rounded-full"></div>
          <span>CDN Detection</span>
        </div>
      </div>
    </motion.div>
  );
};

export default DomainInput;



