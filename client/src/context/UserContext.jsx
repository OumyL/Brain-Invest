import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { canStore, cleanupStorage, logStorageInfo } from '../utils/imageUtils';
import { authManager } from '../utils/authManager';
import { logger } from '../utils/logger';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const createDefaultUser = useCallback(() => {
    // Create default user for demo purposes (backward compatibility)
    const defaultUser = {
      id: 'demo_user_' + Date.now(),
      firstName: 'Utilisateur',
      lastName: 'Demo',
      email: 'demo@comsup.edu',
      role: 'student',
      profilePicture: null,
      documents: [],
      createdAt: new Date().toISOString(),
      isDemo: true
    };
    setCurrentUser(defaultUser);
    setIsAuthenticated(false);
    localStorage.setItem('currentUser', JSON.stringify(defaultUser));
    logger.logUserAction('default_user_created');
  }, []);

  const initializeUserContext = useCallback(async () => {
    try {
      setAuthLoading(true);
      
      // Check if user is authenticated through new auth system
      const authUser = authManager.getCurrentUser();
      const isAuth = authManager.isUserAuthenticated();
      
      if (isAuth && authUser) {
        // User is authenticated through new system
        setCurrentUser(authUser);
        setIsAuthenticated(true);
        logger.logUserAction('user_context_initialized', { 
          source: 'auth_system', 
          userId: authUser.id 
        });
      } else {
        // Fallback to legacy system for backward compatibility
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            setCurrentUser(user);
            setIsAuthenticated(false); // Legacy user, not fully authenticated
            logger.logUserAction('user_context_initialized', { 
              source: 'localStorage_legacy', 
              userId: user.id || 'legacy' 
            });
          } catch (error) {
            console.error('Erreur lors du chargement du profil utilisateur:', error);
            createDefaultUser();
          }
        } else {
          createDefaultUser();
        }
      }
    } catch (error) {
      logger.logError(error, 'user_context_initialization');
      createDefaultUser();
    } finally {
      setAuthLoading(false);
    }
  }, [createDefaultUser]);

  // Initialize user context with authentication integration
  useEffect(() => {
    initializeUserContext();
  }, [initializeUserContext]);

  // Enhanced profile saving with auth integration
  const saveUserProfile = (userProfile) => {
    try {
      const dataToSave = JSON.stringify(userProfile);
      
      // Vérifier si on peut stocker ces données
      if (!canStore(dataToSave)) {
        cleanupStorage();
        
        if (!canStore(dataToSave)) {
          throw new Error('QUOTA_EXCEEDED');
        }
      }
      
      // Update current user state
      setCurrentUser(userProfile);
      localStorage.setItem('currentUser', dataToSave);
      
      // Update auth system if user is authenticated
      if (isAuthenticated && authManager.isUserAuthenticated()) {
        authManager.updateProfile(userProfile);
      }
      
      logger.logUserAction('profile_updated', { userId: userProfile.id });
      console.log('✅ Profil sauvegardé avec succès');
      logStorageInfo();
      
    } catch (error) {
      logger.logError(error, 'profile_save');
      console.error('❌ Erreur lors de la sauvegarde du profil:', error);
      
      if (error.message === 'QUOTA_EXCEEDED' || error.name === 'QuotaExceededError') {
        alert('Erreur: Espace de stockage insuffisant. Veuillez utiliser une image plus petite ou contacter le support.');
      } else {
        alert('Erreur lors de la sauvegarde du profil. Veuillez réessayer.');
      }
      
      throw error;
    }
  };

  // Mettre à jour la photo de profil
  const updateProfilePicture = (imageUrl) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, profilePicture: imageUrl };
      saveUserProfile(updatedUser);
    }
  };

  // Ajouter un document
  const addUserDocument = (document) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        documents: [...(currentUser.documents || []), document]
      };
      saveUserProfile(updatedUser);
    }
  };

  // Supprimer un document
  const removeUserDocument = (documentId) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        documents: (currentUser.documents || []).filter(doc => doc.id !== documentId)
      };
      saveUserProfile(updatedUser);
    }
  };

  // Enhanced logout with auth integration
  const logout = () => {
    logger.logUserAction('user_logout', { userId: currentUser?.id });
    
    // Logout from auth system if authenticated
    if (isAuthenticated && authManager.isUserAuthenticated()) {
      authManager.logout();
    }
    
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('conversations');
    
    // Don't create demo user automatically - let login screen handle it
    // This ensures the login screen appears after logout
  };

  // Authentication helpers
  const loginUser = async (email, password) => {
    try {
      const result = await authManager.login(email, password);
      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        logger.logUserAction('user_login_success', { userId: result.user.id });
        return result;
      }
      return result;
    } catch (error) {
      logger.logError(error, 'user_login');
      return { success: false, error: error.message };
    }
  };

  const registerUser = async (userData) => {
    try {
      const result = await authManager.register(userData);
      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        logger.logUserAction('user_register_success', { userId: result.user.id });
        return result;
      }
      return result;
    } catch (error) {
      logger.logError(error, 'user_register');
      return { success: false, error: error.message };
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (isAuthenticated) {
      return authManager.hasPermission(permission);
    }
    // For demo users, grant basic permissions
    return ['VIEW_SCHEDULE', 'REQUEST_DOCUMENTS'].includes(permission);
  };

  // Ouvrir/fermer la modal de profil
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const value = {
    // User data
    currentUser,
    isAuthenticated,
    authLoading,
    
    // Profile management
    isProfileModalOpen,
    saveUserProfile,
    updateProfilePicture,
    addUserDocument,
    removeUserDocument,
    openProfileModal,
    closeProfileModal,
    
    // Authentication
    loginUser,
    registerUser,
    logout,
    hasPermission,
    
    // Utilities
    initializeUserContext
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
