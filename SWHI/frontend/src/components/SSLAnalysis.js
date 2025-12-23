import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, AlertTriangle, Calendar, Key, Globe, Copy, Check } from 'lucide-react';

const SSLAnalysis = ({ analysis }) => {
  const [copiedField, setCopiedField] = useState(null);
  const sslInfo = analysis.ssl_info || {};

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getValidityStatus = () => {
    if (sslInfo.valid === true) {
      return { status: 'valid', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/20' };
    } else if (sslInfo.valid === false) {
      return { status: 'invalid', icon: XCircle, color: 'text-red-400', bg: 'bg-red-900/20' };
    } else {
      return { status: 'unknown', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getDaysUntilExpiry = (notAfter) => {
    if (!notAfter) return null;
    try {
      const expiryDate = new Date(notAfter);
      const now = new Date();
      const diffTime = expiryDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const validityStatus = getValidityStatus();
  const daysUntilExpiry = getDaysUntilExpiry(sslInfo.not_after);
  const ValidityIcon = validityStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6 rounded-xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 cyber-border rounded-lg">
          <Shield className="h-6 w-6 cyber-text" />
        </div>
        <div>
          <h3 className="text-xl font-bold cyber-text">SSL Certificate Analysis</h3>
          <p className="text-gray-400">Certificate security and validity</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Certificate Status */}
        <div className="cyber-border p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold cyber-text">Certificate Status</h4>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${validityStatus.bg} ${validityStatus.color}`}>
              <ValidityIcon className="h-4 w-4" />
              <span className="font-semibold capitalize">{validityStatus.status}</span>
            </div>
          </div>
          
          {daysUntilExpiry !== null && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Days until expiry</span>
                <span className={`font-semibold ${
                  daysUntilExpiry < 30 ? 'text-red-400' :
                  daysUntilExpiry < 90 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {daysUntilExpiry} days
                </span>
              </div>
              {daysUntilExpiry < 30 && (
                <div className="mt-2 text-sm text-red-400 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Certificate expires soon!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Certificate Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Information */}
          <div className="space-y-4">
            <h4 className="font-semibold cyber-text flex items-center">
              <Key className="h-4 w-4 mr-2" />
              Subject Information
            </h4>
            <div className="cyber-border p-4 rounded-lg space-y-3">
              {sslInfo.subject && Object.entries(sslInfo.subject).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center space-x-2">
                    <span className="cyber-text font-mono text-sm">{value}</span>
                    <button
                      onClick={() => copyToClipboard(value, `subject-${key}`)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      {copiedField === `subject-${key}` ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issuer Information */}
          <div className="space-y-4">
            <h4 className="font-semibold cyber-text flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Issuer Information
            </h4>
            <div className="cyber-border p-4 rounded-lg space-y-3">
              {sslInfo.issuer && Object.entries(sslInfo.issuer).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center space-x-2">
                    <span className="cyber-text font-mono text-sm">{value}</span>
                    <button
                      onClick={() => copyToClipboard(value, `issuer-${key}`)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      {copiedField === `issuer-${key}` ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certificate Dates */}
        <div className="space-y-4">
          <h4 className="font-semibold cyber-text flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Certificate Dates
          </h4>
          <div className="cyber-border p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Valid From</div>
                <div className="cyber-text font-semibold">{formatDate(sslInfo.not_before)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Valid Until</div>
                <div className="cyber-text font-semibold">{formatDate(sslInfo.not_after)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Alternative Names */}
        {sslInfo.subject_alt_names && sslInfo.subject_alt_names.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold cyber-text flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Subject Alternative Names
            </h4>
            <div className="cyber-border p-4 rounded-lg">
              <div className="space-y-2">
                {sslInfo.subject_alt_names.map((san, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                    <span className="cyber-text font-mono text-sm">{san[1]}</span>
                    <button
                      onClick={() => copyToClipboard(san[1], `san-${index}`)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      {copiedField === `san-${index}` ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Certificate Details */}
        <div className="space-y-4">
          <h4 className="font-semibold cyber-text">Certificate Details</h4>
          <div className="cyber-border p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-400">Version</div>
                <div className="cyber-text font-semibold">{sslInfo.version || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Serial Number</div>
                <div className="cyber-text font-mono text-sm">{sslInfo.serial_number || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Signature Algorithm</div>
                <div className="cyber-text font-semibold">RSA-SHA256</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SSLAnalysis;


