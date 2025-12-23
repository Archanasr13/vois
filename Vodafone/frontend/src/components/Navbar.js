import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ isLoggedIn, user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/simulation', label: 'Simulation', icon: '🎯' },
    { path: '/quiz', label: 'Quiz', icon: '📝' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/cyber-health', label: 'Cyber Health', icon: '🛡️' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/threats', label: 'Threats', icon: '🌐' },
    { path: '/swhi', label: 'SWHI', icon: '🔎' },
    { path: '/admin', label: 'Admin', icon: '⚙️' }
  ];

  return (
    <nav className="glassmorphism border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-2 max-w-full">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-1 flex-shrink-0">
            <div className="w-7 h-7 bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">🛡️</span>
            </div>
            <span className="text-white font-cyber font-bold text-base hidden lg:inline">
              Unified Cybersecurity Platform
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-0.5 justify-end flex-nowrap">
            {navItems.filter(item => {
              if (item.path === '/admin') {
                return user && user.role === 'admin';
              }
              return true;
            }).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded-md transition-all duration-200 text-xs whitespace-nowrap ${location.pathname === item.path
                  ? 'bg-white/20 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {isLoggedIn ? (
              <div className="flex items-center space-x-2 ml-2">
                <span className="text-gray-300 text-xs">
                  {user?.name}
                </span>
                <button
                  onClick={onLogout}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 ml-2">
                <Link
                  to="/login"
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


