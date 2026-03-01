import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './api';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/Navigation';
import UsernameSetupModal from './components/UsernameSetupModal';
import Home from './pages/Home';
import WordDetail from './pages/WordDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Submissions from './pages/Submissions';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token) {
      authAPI.getCurrentUser()
        .then(res => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
          // Show username setup modal if user doesn't have a username
          if (!res.data.username) {
            setShowUsernameSetup(true);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // Show username setup modal if user doesn't have a username
    if (!userData.username) {
      setShowUsernameSetup(true);
    }
  };

  const handleUsernameSet = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setShowUsernameSetup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <ThemeProvider>
      <Router basename="/made-up-wiki">
        <Navigation user={user} onLogout={handleLogout} />
        <UsernameSetupModal
          isOpen={showUsernameSetup}
          user={user}
          onUsernameSet={handleUsernameSet}
        />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/word/:wordName" element={<WordDetail user={user} />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup onSignup={handleLogin} />} />
          <Route path="/admin" element={user && user.is_admin ? <Admin user={user} /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/submissions" element={user ? <Submissions user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
