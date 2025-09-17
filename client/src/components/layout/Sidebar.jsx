import React, { useContext, useState, useEffect, useRef } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import NewChatButton from '../sidebar/NewChatButton';
import ConversationItem from '../sidebar/ConversationItem';
import ThemeToggle from '../ui/ThemeToggle';
import VersionControl from '../admin/VersionControl';
import AuthModal from '../auth/AuthModal';
import { versionManager } from '../../utils/versionControl';
import { logger } from '../../utils/logger';

const Sidebar = ({ isMobileOpen, onClose, isVisible }) => {
  const { conversations } = useContext(ChatContext);
  const { isDark } = useContext(ThemeContext);
  const { currentUser, isAuthenticated, loginUser, registerUser, openProfileModal, hasPermission, logout } = useUser();
  const [showVersionControl, setShowVersionControl] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showUserMenu]);

  const handleAuthSuccess = (user) => {
    logger.logUserAction('sidebar_auth_success', { userId: user.id });
    setShowAuthModal(false);
  };

  const handleShowVersionControl = () => {
    if (hasPermission('MANAGE_SYSTEM') || currentUser?.isDemo) {
      setShowVersionControl(true);
      logger.logUserAction('version_control_opened');
    } else {
      alert('AccÃ¨s restreint aux administrateurs');
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('ÃŠtes-vous sÃ»r de vouloir vous dÃ©connecter ?');
    if (confirmLogout) {
      logout();
      setShowUserMenu(false);
      logger.logUserAction('user_logged_out', { userId: currentUser?.id });
    }
  };

  // Choisir le logo en fonction du thÃ¨me
  const logoSrc = isDark ? '/images/brain-logo-d.png' : '/images/brain-logo-l.png';

  // Classes CSS pour le comportement responsive et la visibilitÃ©
  const sidebarClasses = `
    bg-white dark:bg-brand-dark
    border-r border-neutral-200/70 dark:border-brand-blue/10 flex flex-col h-full
    md:relative md:min-w-[0px] md:transition-all md:duration-300 md:ease-in-out
    ${isVisible ? 'md:w-80 md:opacity-100' : 'md:w-0 md:opacity-0 md:overflow-hidden'}
    ${isMobileOpen 
      ? 'fixed inset-0 z-40 w-full backdrop-blur-lg' 
      : 'hidden md:flex'
    }
  `;

  return (
    <aside className={sidebarClasses}>
      {/* En-tÃªte du sidebar */}
      <div className="p-4 pb-4 border-b border-neutral-200/70 dark:border-brand-blue/10">
        {/* Logo MR ComSup */}
        <div className="relative w-full border-2 border-brand-blue/30 dark:border-brand-blue/20 rounded-lg p-3 bg-white/80 dark:bg-brand-dark/80 shadow-sm">
          <img 
            src={logoSrc}
            alt="MR ComSup Logo" 
            className="w-full h-auto max-h-24 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              document.getElementById('text-logo').style.display = 'block';
            }} 
          />
          <h1 
            id="text-logo" 
            className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-blue-500 bg-clip-text text-transparent text-center"
            style={{display: 'none'}}
          >
            MR ComSup
          </h1>
          
          {/* Bouton mode clair/sombre */}
          <div className="absolute top-2 right-2">
            <ThemeToggle />
          </div>
          
          {/* Bouton fermeture mobile */}
          {isMobileOpen && (
            <button 
              onClick={onClose}
              className="md:hidden absolute top-2 left-2 p-1.5 rounded-md bg-white/80 dark:bg-brand-dark/80 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Profil utilisateur avec statut d'authentification */}
      {currentUser ? (
        <div className="p-4 border-b border-neutral-200/70 dark:border-brand-blue/10 relative">
          <div className="flex items-center space-x-3">
            <button 
              onClick={openProfileModal}
              className="flex-1 flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-brand-dark/80 transition-colors text-left"
            >
              <div className="flex-shrink-0 relative">
                {currentUser.profilePicture ? (
                  <img 
                    src={currentUser.profilePicture}
                    alt={`${currentUser.firstName || 'Utilisateur'}`}
                    className="w-10 h-10 rounded-full object-cover border-2 border-brand-blue"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-blue-500 flex items-center justify-center text-white font-medium">
                    {currentUser.firstName ? currentUser.firstName[0].toUpperCase() : 'U'}
                  </div>
                )}
                {/* Auth status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                  isAuthenticated ? 'bg-green-500' : 'bg-orange-500'
                }`} title={isAuthenticated ? 'AuthentifiÃ©' : 'Session demo'}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-brand-dark dark:text-brand-white text-sm truncate">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  {currentUser.isDemo && (
                    <span className="bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5 rounded">
                      Demo
                    </span>
                  )}
                  {isAuthenticated && (
                    <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">
                      âœ“
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {currentUser.email}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 capitalize">
                  {currentUser.role || 'student'}
                </p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-neutral-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            {/* User menu dropdown button */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-brand-dark/80 transition-colors"
                title="Menu utilisateur"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
              </button>
              
              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        openProfileModal();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      <span>Mon profil</span>
                    </button>
                    
                    {!isAuthenticated && currentUser.isDemo && (
                      <button
                        onClick={() => {
                          setShowAuthModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <span>Se connecter</span>
                      </button>
                    )}
                    
                    <div className="border-t border-neutral-200 dark:border-gray-600 my-1"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                      <span>Se dÃ©connecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Authentication prompt for demo users */}
          {!isAuthenticated && currentUser.isDemo && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                ðŸ” AccÃ©dez Ã  toutes les fonctionnalitÃ©s
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full text-xs bg-blue-600 text-white py-1.5 px-3 rounded hover:bg-blue-700 transition-colors"
              >
                Se connecter / S'inscrire
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 border-b border-neutral-200/70 dark:border-brand-blue/10">
          <button 
            onClick={() => setShowAuthModal(true)}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-brand-blue text-white hover:bg-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="text-sm font-medium">Se connecter</span>
          </button>
        </div>
      )}

      {/* Bouton nouvelle conversation */}
      <div className="p-4">
        <NewChatButton />
      </div>
      
      {/* Titre de la section */}
      <div className="px-4 mb-2">
        <h2 className="text-xs text-neutral-500 dark:text-brand-gray font-medium uppercase tracking-wider">Conversations rÃ©centes</h2>
      </div>
      
      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 custom-scrollbar">
        {conversations.length > 0 ? (
          conversations.map(conversation => (
            <ConversationItem 
              key={conversation.id} 
              conversation={conversation}
            />
          ))
        ) : (
          <div className="text-center p-4 text-neutral-500 dark:text-neutral-400 text-sm italic">
            Aucune conversation. <br />
            Cliquez sur "Nouvelle conversation" pour commencer.
          </div>
        )}
      </div>
      
      {/* Pied de page avec version et contrÃ´les admin */}
      <div className="p-4 border-t border-neutral-200/70 dark:border-brand-blue/10">
        {/* Version control button for admins or demo users */}
        {(hasPermission('MANAGE_SYSTEM') || currentUser?.isDemo) && (
          <button
            onClick={handleShowVersionControl}
            className="w-full mb-3 flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            <span>ðŸ”§</span>
            <span>Version & Backup</span>
          </button>
        )}
        
        {/* App info */}
        <div className="text-xs text-center space-y-1">
          <p className="bg-gradient-to-r from-brand-blue to-blue-500 bg-clip-text text-transparent font-semibold">
            ComNect - Powered by BRAIN
          </p>
          <p className="text-neutral-400 dark:text-neutral-500">
            v{versionManager.getCurrentVersion().version}
          </p>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      
      {/* Version Control Modal */}
      <VersionControl
        isOpen={showVersionControl}
        onClose={() => setShowVersionControl(false)}
      />
    </aside>
  );
};

export default Sidebar;