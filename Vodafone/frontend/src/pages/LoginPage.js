import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await API.authLogin({ email, password });
      if (data && data.success) {
        // Store user data and token
        try {
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.token) localStorage.setItem('token', data.token);
          localStorage.setItem('isLoggedIn', 'true');
        } catch (e) {}

        // Update parent component state
        onLogin(data.user);
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError((data && data.message) || 'Login failed');
      }
    } catch (err) {
      // Show network errors or backend-provided messages
      if (err && err.message) setError(err.message);
      else setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { name: "John Smith (IT)", email: "john.smith@company.com", password: "password123" },
    { name: "Sarah Johnson (HR)", email: "sarah.johnson@company.com", password: "password123" },
    { name: "Mike Chen (Finance)", email: "mike.chen@company.com", password: "password123" },
    { name: "Lisa Davis (Admin)", email: "lisa.davis@company.com", password: "password123" }
  ];

  const fillDemoCredentials = (email, password) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glassmorphism rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 font-cyber">
            Login
          </h1>
          <p className="text-gray-300">
            Access your cybersecurity training dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-300 mb-4 text-center">
            Demo Credentials
          </h3>
          <div className="space-y-2">
            {demoCredentials.map((cred, index) => (
              <button
                key={index}
                onClick={() => fillDemoCredentials(cred.email, cred.password)}
                className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <div className="text-white text-sm font-medium">{cred.name}</div>
                <div className="text-gray-400 text-xs">{cred.email}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-400 hover:text-green-300 font-medium">
              Register here
            </Link>
          </p>
          <p className="text-gray-400 text-sm">
            Demo accounts use password: <span className="text-blue-400 font-mono">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
