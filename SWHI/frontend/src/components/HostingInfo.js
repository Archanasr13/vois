import React from 'react';
import { motion } from 'framer-motion';
import { Server, MapPin, Globe, Shield, Cloud, AlertTriangle } from 'lucide-react';

const HostingInfo = ({ analysis }) => {
  const ipInfo = analysis.ip_info || {};
  const geoInfo = ipInfo.geolocation || {};
  const asnInfo = ipInfo.asn || {};
  const cdnInfo = analysis.cdn_detection || {};

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe': return <Shield className="h-4 w-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'danger': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <Globe className="h-4 w-4 text-cyber-blue" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'safe': return 'Safe';
      case 'warning': return 'Warning';
      case 'danger': return 'Danger';
      default: return 'Unknown';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6 rounded-xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 cyber-border rounded-lg">
          <Server className="h-6 w-6 cyber-text" />
        </div>
        <div>
          <h3 className="text-xl font-bold cyber-text">Hosting Information</h3>
          <p className="text-gray-400">Real infrastructure details</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* IP Address */}
        <div className="space-y-3">
          <h4 className="font-semibold cyber-text flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            IP Address
          </h4>
          <div className="cyber-border p-4 rounded-lg">
            <div className="font-mono text-lg cyber-text">{ipInfo.ip || 'N/A'}</div>
            {ipInfo.is_private && (
              <div className="text-yellow-400 text-sm mt-1 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Private IP Address
              </div>
            )}
          </div>
        </div>

        {/* Geolocation */}
        {geoInfo.country && (
          <div className="space-y-3">
            <h4 className="font-semibold cyber-text flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </h4>
            <div className="cyber-border p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Country</div>
                  <div className="cyber-text font-semibold">{geoInfo.country}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">City</div>
                  <div className="cyber-text font-semibold">{geoInfo.city || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Region</div>
                  <div className="cyber-text font-semibold">{geoInfo.region || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Timezone</div>
                  <div className="cyber-text font-semibold">{geoInfo.timezone || 'Unknown'}</div>
                </div>
              </div>
              {(geoInfo.latitude && geoInfo.longitude) && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-sm text-gray-400">Coordinates</div>
                  <div className="cyber-text font-mono">
                    {geoInfo.latitude}, {geoInfo.longitude}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ASN Information */}
        {asnInfo.asn && (
          <div className="space-y-3">
            <h4 className="font-semibold cyber-text">Network Information</h4>
            <div className="cyber-border p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">ASN</div>
                  <div className="cyber-text font-semibold">{asnInfo.asn}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Organization</div>
                  <div className="cyber-text font-semibold">{asnInfo.org || 'Unknown'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CDN Detection */}
        <div className="space-y-3">
          <h4 className="font-semibold cyber-text flex items-center">
            <Cloud className="h-4 w-4 mr-2" />
            CDN Detection
          </h4>
          <div className="cyber-border p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">CDN Detected</div>
                <div className="cyber-text font-semibold">
                  {cdnInfo.detected ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(cdnInfo.detected ? 'warning' : 'safe')}
                <span className="text-sm">
                  {getStatusText(cdnInfo.detected ? 'warning' : 'safe')}
                </span>
              </div>
            </div>
            {cdnInfo.provider && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-sm text-gray-400">CDN Provider</div>
                <div className="cyber-text font-semibold capitalize">{cdnInfo.provider}</div>
              </div>
            )}
          </div>
        </div>

        {/* ISP Information */}
        {geoInfo.isp && (
          <div className="space-y-3">
            <h4 className="font-semibold cyber-text">ISP Information</h4>
            <div className="cyber-border p-4 rounded-lg">
              <div className="text-sm text-gray-400">Internet Service Provider</div>
              <div className="cyber-text font-semibold">{geoInfo.isp}</div>
            </div>
          </div>
        )}

        {/* Bypass Attempts */}
        {cdnInfo.bypass_attempts && cdnInfo.bypass_attempts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold cyber-text">CDN Bypass Attempts</h4>
            <div className="cyber-border p-4 rounded-lg">
              <div className="space-y-2">
                {cdnInfo.bypass_attempts.map((attempt, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">DNS Server: {attempt.dns_server}</div>
                    <div className="cyber-text font-mono text-sm">
                      {attempt.ips.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HostingInfo;



