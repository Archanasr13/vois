import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ isLoggedIn }) => {
  // Fallback to localStorage in case prop not passed
  const loggedIn = typeof isLoggedIn === 'boolean' ? isLoggedIn : (localStorage.getItem('isLoggedIn') === 'true');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-16">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🛡️</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-cyber">
            Unified Cybersecurity Simulation and Threat Intelligence Platform
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            A comprehensive platform combining realistic phishing simulations, interactive training,
            real-time threat intelligence, and advanced domain analysis (SWHI) for complete cybersecurity awareness.
          </p>
        </div>

        {!loggedIn && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/login"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              🔐 Login
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              👤 Register
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="glassmorphism rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-white mb-3">Realistic Simulations</h3>
          <p className="text-gray-300">
            Experience authentic phishing emails and ransomware scenarios
            in a safe training environment.
          </p>
        </div>

        <div className="glassmorphism rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white mb-3">Progress Tracking</h3>
          <p className="text-gray-300">
            Monitor your cybersecurity awareness progress with detailed
            analytics and personalized recommendations.
          </p>
        </div>

        <div className="glassmorphism rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold text-white mb-3">Interactive Learning</h3>
          <p className="text-gray-300">
            Learn through hands-on quizzes and immediate feedback
            to reinforce cybersecurity best practices.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="glassmorphism rounded-xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Platform Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">4</div>
            <div className="text-gray-300">Demo Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">3</div>
            <div className="text-gray-300">Simulation Types</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">5</div>
            <div className="text-gray-300">Quiz Questions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">100%</div>
            <div className="text-gray-300">Safe Training</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Test Your Cybersecurity Skills?
        </h2>
        <p className="text-gray-300 mb-8">
          Start with a simulation or jump straight into our awareness quiz.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200"
          >
            Create Account
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;


