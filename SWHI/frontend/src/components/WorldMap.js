import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe } from 'lucide-react';

const WorldMap = ({ lat, lng, country, city }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng) return;

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = await import('leaflet');
      
      // Fix for default markers in React
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current).setView([lat, lng], 6);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Add custom marker
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #00eeff, #00ff88);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid #0a0a0a;
            box-shadow: 0 0 20px rgba(0, 238, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0a0a0a;
            font-weight: bold;
            font-size: 12px;
          ">📍</div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0a0a0a; font-family: monospace;">
            <strong>${city || 'Unknown City'}, ${country || 'Unknown Country'}</strong><br>
            <small>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</small>
          </div>
        `)
        .openPopup();
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [lat, lng, country, city]);

  if (!lat || !lng) {
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
            <h3 className="text-xl font-bold cyber-text">Geographic Location</h3>
            <p className="text-gray-400">IP geolocation mapping</p>
          </div>
        </div>
        <div className="cyber-border p-8 rounded-lg text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <div className="cyber-text font-semibold">Location Data Not Available</div>
          <div className="text-gray-400 text-sm mt-2">Unable to determine geographic location</div>
        </div>
      </motion.div>
    );
  }

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
          <h3 className="text-xl font-bold cyber-text">Geographic Location</h3>
          <p className="text-gray-400">IP geolocation mapping</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Location Info */}
        <div className="cyber-border p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold cyber-text">{country || 'Unknown'}</div>
              <div className="text-sm text-gray-400">Country</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold cyber-text">{city || 'Unknown'}</div>
              <div className="text-sm text-gray-400">City</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold cyber-text">
                {lat.toFixed(2)}, {lng.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Coordinates</div>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="cyber-border rounded-lg overflow-hidden">
          <div 
            ref={mapRef} 
            style={{ height: '400px', width: '100%' }}
            className="relative"
          >
            {/* Loading overlay */}
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyber-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                <div className="cyber-text font-semibold">Loading Map...</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyber-blue rounded-full"></div>
            <span>Target Location</span>
          </div>
          <div className="text-xs">
            Interactive map powered by OpenStreetMap
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WorldMap;



