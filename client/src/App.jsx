// src/App.jsx - Version finale avec gestion admin
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/auth/AuthPage';
import AdminDashboard from './components/admin/AdminDashboard';
import Layout from './components/layout/Layout';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { ProjectProvider } from './context/ProjectContext';
import { ChatProvider } from './context/ChatContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('brain_invest_token');
        const savedUser = localStorage.getItem('brain_invest_user');

        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          
          if (userData && userData.id) {
            const response = await fetch('http://localhost:3001/api/auth/verify', {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
              const result = await response.json();
              setUser(result.user);
              console.log('User authenticated:', result.user.email, 'Role:', result.user.role);
            } else {
              console.warn('Token verification failed');
              clearAuthData();
            }
          } else {
            console.warn('Invalid user data in localStorage');
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        clearAuthData();
        setAuthError('Session expirée, veuillez vous reconnecter');
      } finally {
        setLoading(false);
      }
    };

    const clearAuthData = () => {
      localStorage.removeItem('brain_invest_token');
      localStorage.removeItem('brain_invest_user');
      setUser(null);
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setAuthError(null);
    console.log('User logged in:', userData.email, 'Role:', userData.role);
  };

  const handleLogout = () => {
    localStorage.removeItem('brain_invest_token');
    localStorage.removeItem('brain_invest_user');
    setUser(null);
    setAuthError(null);
    console.log('User logged out');
  };

  // Affichage de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">🧠</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Initialisation de Brain Invest...</p>
          <p className="text-blue-300 text-sm mt-2">Vérification de l'authentification</p>
        </div>
      </div>
    );
  }

  // Page d'authentification si pas connecté
  if (!user) {
    return (
      <div>
        <AuthPage onLogin={handleLogin} />
        {authError && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {authError}
          </div>
        )}
      </div>
    );
  }

  // Interface admin spéciale
  if (user.role === 'admin') {
    return (
      <Router>
        <ThemeProvider>
          <Routes>
            {/* Interface admin par défaut */}
            <Route 
              path="/" 
              element={<AdminDashboard user={user} onLogout={handleLogout} />} 
            />
            
            {/* Interface utilisateur pour admin (optionnelle) */}
            <Route 
              path="/user-interface" 
              element={
                <UserProvider initialUser={user}>
                  <ProjectProvider>
                    <ChatProvider>
                      <Layout user={user} onLogout={handleLogout} isAdmin={true} />
                    </ChatProvider>
                  </ProjectProvider>
                </UserProvider>
              } 
            />
            
            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </Router>
    );
  }

  // Interface utilisateur normale
  return (
    <Router>
      <ThemeProvider>
        <UserProvider initialUser={user}>
          <ProjectProvider>
            <ChatProvider>
              <Routes>
                <Route 
                  path="/" 
                  element={<Layout user={user} onLogout={handleLogout} />} 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ChatProvider>
          </ProjectProvider>
        </UserProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;