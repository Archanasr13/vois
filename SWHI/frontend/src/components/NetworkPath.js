import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, MapPin, Clock, Server, AlertTriangle } from 'lucide-react';

const NetworkPath = ({ analysis }) => {
  const [tracerouteData, setTracerouteData] = useState(null);
  const [loading, setLoading] = useState(false);

  const ipInfo = analysis.ip_info || {};
  const geoInfo = ipInfo.geolocation || {};

  // Simulate traceroute data (in a real implementation, this would be done server-side)
  const simulateTraceroute = async () => {
    setLoading(true);
    
    // Simulate network path with realistic data
    const mockTraceroute = [
      { hop: 1, ip: '192.168.1.1', hostname: 'router.local', rtt: '0.5ms', location: 'Local Network' },
      { hop: 2, ip: '10.0.0.1', hostname: 'gateway.isp.com', rtt: '2.1ms', location: 'ISP Gateway' },
      { hop: 3, ip: '203.0.113.1', hostname: 'core-router.isp.com', rtt: '5.3ms', location: 'ISP Core' },
      { hop: 4, ip: '198.51.100.1', hostname: 'peering.ix.net', rtt: '12.7ms', location: 'Internet Exchange' },
      { hop: 5, ip: ipInfo.ip, hostname: analysis.domain, rtt: '18.2ms', location: `${geoInfo.city}, ${geoInfo.country}` }
    ];

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTracerouteData(mockTraceroute);
    setLoading(false);
  };

  useEffect(() => {
    if (analysis && !tracerouteData) {
      simulateTraceroute();
    }
  }, [analysis]);

  const getRTTColor = (rtt) => {
    const rttNum = parseFloat(rtt);
    if (rttNum < 10) return 'text-green-400';
    if (rttNum < 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRTTBg = (rtt) => {
    const rttNum = parseFloat(rtt);
    if (rttNum < 10) return 'bg-green-900/20';
    if (rttNum < 50) return 'bg-yellow-900/20';
    return 'bg-red-900/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6 rounded-xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 cyber-border rounded-lg">
          <Network className="h-6 w-6 cyber-text" />
        </div>
        <div>
          <h3 className="text-xl font-bold cyber-text">Network Path Analysis</h3>
          <p className="text-gray-400">Traceroute and network topology</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Network Summary */}
        <div className="cyber-border p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold cyber-text">{tracerouteData?.length || 0}</div>
              <div className="text-sm text-gray-400">Network Hops</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold cyber-text">
                {tracerouteData ? `${tracerouteData[tracerouteData.length - 1]?.rtt || 'N/A'}` : 'N/A'}
              </div>
              <div className="text-sm text-gray-400">Total RTT</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold cyber-text">
                {geoInfo.country || 'Unknown'}
              </div>
              <div className="text-sm text-gray-400">Destination</div>
            </div>
          </div>
        </div>

        {/* Traceroute Results */}
        {loading ? (
          <div className="cyber-border p-8 rounded-lg text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyber-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="cyber-text font-semibold">Tracing network path...</div>
            <div className="text-gray-400 text-sm mt-2">This may take a few moments</div>
          </div>
        ) : tracerouteData ? (
          <div className="space-y-3">
            <h4 className="font-semibold cyber-text">Traceroute Results</h4>
            <div className="cyber-border rounded-lg overflow-hidden">
              {tracerouteData.map((hop, index) => (
                <motion.div
                  key={hop.hop}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border-b border-gray-700 last:border-b-0 ${
                    index === tracerouteData.length - 1 ? 'bg-cyber-blue/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 cyber-border rounded-full flex items-center justify-center text-sm font-bold cyber-text">
                          {hop.hop}
                        </div>
                        <div>
                          <div className="font-mono cyber-text">{hop.ip}</div>
                          <div className="text-sm text-gray-400">{hop.hostname}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`font-semibold ${getRTTColor(hop.rtt)}`}>
                          {hop.rtt}
                        </div>
                        <div className="text-xs text-gray-400">RTT</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm cyber-text">{hop.location}</div>
                        <div className="text-xs text-gray-400">Location</div>
                      </div>
                      {index === tracerouteData.length - 1 && (
                        <div className="p-2 cyber-border rounded-lg">
                          <MapPin className="h-4 w-4 cyber-text" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="cyber-border p-8 rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-4" />
            <div className="cyber-text font-semibold">Traceroute Not Available</div>
            <div className="text-gray-400 text-sm mt-2">Unable to perform network path analysis</div>
          </div>
        )}

        {/* Network Analysis */}
        {tracerouteData && (
          <div className="space-y-4">
            <h4 className="font-semibold cyber-text">Network Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="cyber-border p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-4 w-4 cyber-text" />
                  <span className="font-semibold cyber-text">Latency Analysis</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Average RTT</span>
                    <span className="cyber-text">
                      {tracerouteData.length > 0 
                        ? `${(tracerouteData.reduce((sum, hop) => sum + parseFloat(hop.rtt), 0) / tracerouteData.length).toFixed(1)}ms`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Max RTT</span>
                    <span className="cyber-text">
                      {Math.max(...tracerouteData.map(hop => parseFloat(hop.rtt)))}ms
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Min RTT</span>
                    <span className="cyber-text">
                      {Math.min(...tracerouteData.map(hop => parseFloat(hop.rtt)))}ms
                    </span>
                  </div>
                </div>
              </div>

              <div className="cyber-border p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Server className="h-4 w-4 cyber-text" />
                  <span className="font-semibold cyber-text">Path Analysis</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Hops</span>
                    <span className="cyber-text">{tracerouteData.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Destination</span>
                    <span className="cyber-text">{geoInfo.country || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Path Quality</span>
                    <span className="cyber-text">
                      {tracerouteData.length < 10 ? 'Good' : 'Fair'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NetworkPath;



