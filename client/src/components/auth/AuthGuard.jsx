import React, { useState, useEffect } from 'react';
import { authManager } from '../../utils/authManager';
import { logger } from '../../utils/logger';
import AuthModal from './AuthModal';

/**
 * AuthGuard component that wraps protected content
 * Falls back to existing functionality if user is not authenticated
 */
const AuthGuard = ({ children, fallback = null, requireAuth = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authManager.isUserAuthenticated());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(authManager.getCurrentUser());

  useEffect(() => {
    // Listen for auth state changes
    const checkAuthState = () => {
      setIsAuthenticated(authManager.isUserAuthenticated());
      setCurrentUser(authManager.getCurrentUser());
    };

    // Check auth state periodically
    const interval = setInterval(checkAuthState, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    logger.logUserAction('auth_guard_access_granted', { userId: user.id });
  };

  const handleShowAuth = () => {
    setShowAuthModal(true);
    logger.logUserAction('auth_modal_opened', { context: 'auth_guard' });
  };

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentification requise
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Veuillez vous connecter pour accéder à cette fonctionnalité.
          </p>
          <button
            onClick={handleShowAuth}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // If authentication is optional and user is not authenticated, show fallback
  if (!requireAuth && !isAuthenticated && fallback) {
    return fallback;
  }

  // User is authenticated or authentication is not required
  return children;
};

export default AuthGuard;