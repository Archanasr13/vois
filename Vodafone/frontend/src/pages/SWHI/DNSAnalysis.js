import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ChevronDown, ChevronRight, Copy, Check, AlertTriangle } from 'lucide-react';

const DNSAnalysis = ({ analysis }) => {
  const [expandedRecords, setExpandedRecords] = useState({});
  const [copiedRecord, setCopiedRecord] = useState(null);

  const dnsRecords = analysis.dns_records || {};

  const recordTypes = [
    { key: 'A', name: 'A Records', description: 'IPv4 addresses' },
    { key: 'AAAA', name: 'AAAA Records', description: 'IPv6 addresses' },
    { key: 'MX', name: 'MX Records', description: 'Mail exchange servers' },
    { key: 'NS', name: 'NS Records', description: 'Name servers' },
    { key: 'TXT', name: 'TXT Records', description: 'Text records' },
    { key: 'CNAME', name: 'CNAME Records', description: 'Canonical names' }
  ];

  const toggleRecord = (recordType) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordType]: !prev[recordType]
    }));
  };

  const copyToClipboard = async (text, recordType) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRecord(recordType);
      setTimeout(() => setCopiedRecord(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatRecordValue = (record) => {
    if (typeof record === 'string') {
      return record;
    }
    return JSON.stringify(record);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6 rounded-xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 cyber-border rounded-lg">
          <Globe className="h-6 w-6 cyber-text" />
        </div>
        <div>
          <h3 className="text-xl font-bold cyber-text">DNS Analysis</h3>
          <p className="text-gray-400">Domain name system records</p>
        </div>
      </div>

      <div className="space-y-4 relative">
        {Object.values(dnsRecords).flat().length === 0 && (
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg border border-dashed border-gray-700">
            <div className="text-center p-6">
              <AlertTriangle className="h-10 w-10 text-yellow-500/50 mx-auto mb-2" />
              <p className="text-gray-400 font-semibold italic">No DNS records detected for this host</p>
              <p className="text-xs text-gray-500">The domain might be unregistered or dormant.</p>
            </div>
          </div>
        )}
        {recordTypes.map((recordType) => {
          const records = dnsRecords[recordType.key] || [];
          const isExpanded = expandedRecords[recordType.key];
          const hasRecords = records.length > 0;

          return (
            <motion.div
              key={recordType.key}
              className="cyber-border rounded-lg overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * recordTypes.indexOf(recordType) }}
            >
              <button
                onClick={() => toggleRecord(recordType.key)}
                className="w-full p-4 text-left hover:bg-gray-800/50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 cyber-text" />
                    ) : (
                      <ChevronRight className="h-4 w-4 cyber-text" />
                    )}
                    <div>
                      <div className="font-semibold cyber-text">{recordType.name}</div>
                      <div className="text-sm text-gray-400">{recordType.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs ${hasRecords ? 'bg-green-900/20 text-green-400' : 'bg-gray-900/20 text-gray-400'
                      }`}>
                      {records.length} record{records.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-700"
                >
                  <div className="p-4 space-y-2">
                    {hasRecords ? (
                      records.map((record, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                        >
                          <div className="font-mono text-sm cyber-text flex-1">
                            {formatRecordValue(record)}
                          </div>
                          <button
                            onClick={() => copyToClipboard(formatRecordValue(record), `${recordType.key}-${index}`)}
                            className="ml-2 p-1 hover:bg-gray-700 rounded transition-colors"
                          >
                            {copiedRecord === `${recordType.key}-${index}` ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-400">
                        No {recordType.name.toLowerCase()} found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* DNS Summary */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h4 className="font-semibold cyber-text mb-3">DNS Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {recordTypes.map((recordType) => {
            const count = (dnsRecords[recordType.key] || []).length;
            return (
              <div key={recordType.key} className="text-center">
                <div className="text-2xl font-bold cyber-text">{count}</div>
                <div className="text-xs text-gray-400">{recordType.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default DNSAnalysis;



