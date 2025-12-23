import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SimulationPage from './pages/SimulationPage';
import QuizPage from './pages/QuizPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AICyberCoach from './pages/AICyberCoach';
import AdminAIDashboard from './pages/AdminAIDashboard';
import AdaptiveQuiz from './pages/AdaptiveQuiz';
import RoleSimulation from './pages/RoleSimulation';
import IncidentResponse from './pages/IncidentResponse';
import Leaderboard from './pages/Leaderboard';
import ThreatFeed from './pages/ThreatFeed';
import ThreatIntelligence from './pages/ThreatIntelligence';
import CertificatePage from './pages/Certificate';
import DashboardPhase2 from './pages/DashboardPhase2';
import CyberHealthDashboard from './pages/CyberHealthDashboard';
import SWHIPage from './pages/SWHI/SWHIPage';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userData = localStorage.getItem('user');

    if (loggedIn && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Listen for storage changes (when user logs in from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userData = localStorage.getItem('user');

      if (loggedIn && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
        <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
            <Route
              path="/simulation"
              element={isLoggedIn ? <SimulationPage user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/quiz"
              element={isLoggedIn ? <QuizPage user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard"
              element={isLoggedIn ? <UserDashboard user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin"
              element={isLoggedIn && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to={isLoggedIn ? "/" : "/login"} />}
            />
            <Route path="/coach" element={isLoggedIn ? <AICyberCoach user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin-ai" element={isLoggedIn && user?.role === 'admin' ? <AdminAIDashboard /> : <Navigate to={isLoggedIn ? "/" : "/login"} />} />
            <Route path="/adaptive-quiz" element={isLoggedIn ? <AdaptiveQuiz user={user} /> : <Navigate to="/login" />} />
            <Route path="/role-sim" element={isLoggedIn ? <RoleSimulation user={user} /> : <Navigate to="/login" />} />
            <Route path="/incident" element={isLoggedIn ? <IncidentResponse user={user} /> : <Navigate to="/login" />} />
            <Route path="/leaderboard" element={isLoggedIn ? <Leaderboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/threats" element={isLoggedIn ? <ThreatFeed user={user} /> : <Navigate to="/login" />} />
            <Route path="/intelligence" element={isLoggedIn ? <ThreatIntelligence user={user} /> : <Navigate to="/login" />} />
            <Route path="/certificate" element={isLoggedIn ? <CertificatePage user={user} /> : <Navigate to="/login" />} />
            <Route path="/phase2" element={isLoggedIn ? <DashboardPhase2 user={user} /> : <Navigate to="/login" />} />
            <Route path="/cyber-health" element={isLoggedIn ? <CyberHealthDashboard /> : <Navigate to="/login" />} />
            <Route path="/swhi" element={isLoggedIn ? <SWHIPage user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;


