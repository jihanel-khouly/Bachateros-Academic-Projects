import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Register from './pages/Register';
import Login from './pages/Login';
import TwoFactorSetup from './pages/TwoFactorSetup';
import TwoFactorVerify from './pages/TwoFactorVerify';
import Dashboard from './pages/Dashboard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [sessionToken, setSessionToken] = useState(null);
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (jwtToken) {
      fetchUserProfile();
    }
  }, [jwtToken]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      setUser(response.data);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.removeItem('jwtToken');
      setJwtToken(null);
    }
  };

  const handleRegisterSuccess = () => {
    setCurrentPage('login');
  };

  const handleLoginSuccess = (token) => {
    setSessionToken(token);
    setCurrentPage('2fa-setup');
  };

  const handleTwoFactorSetupComplete = () => {
    setCurrentPage('2fa-verify');
  };

  const handleTwoFactorVerifySuccess = (token) => {
    localStorage.setItem('jwtToken', token);
    setJwtToken(token);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setJwtToken(null);
    setSessionToken(null);
    setUser(null);
    setCurrentPage('login');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app">
      {currentPage === 'register' && (
        <Register onSuccess={handleRegisterSuccess} onNavigate={handleNavigate} />
      )}
      {currentPage === 'login' && (
        <Login onSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
      )}
      {currentPage === '2fa-setup' && sessionToken && (
        <TwoFactorSetup sessionToken={sessionToken} onComplete={handleTwoFactorSetupComplete} />
      )}
      {currentPage === '2fa-verify' && sessionToken && (
        <TwoFactorVerify sessionToken={sessionToken} onSuccess={handleTwoFactorVerifySuccess} />
      )}
      {currentPage === 'dashboard' && jwtToken && (
        <Dashboard jwtToken={jwtToken} user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
