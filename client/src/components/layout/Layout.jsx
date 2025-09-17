// src/components/layout/Layout.jsx - Palette noir et vert avec logos
import React, { useState, useEffect } from 'react';
import { useChatContext } from '../../context/ChatContext';
import ResizableChatContainer from './ResizableChatContainer';
import { Menu, X, LogOut, MessageCircle, TrendingUp, Shield, Sun, Moon, Trash2 } from 'lucide-react';

const Layout = ({ user, onLogout, isAdmin }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [currentProject, setCurrentProject] = useState('general');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('brain_invest_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const { conversations, activeConversation, createNewConversation, setActiveConversation, deleteConversation, hasSymbolInLastMessage } = useChatContext();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('brain_invest_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (hasSymbolInLastMessage()) {
      setCurrentProject('trading');
      setIsSidebarVisible(false);
    }
  }, [hasSymbolInLastMessage]);

  // Supprimer cette logique qui force la sidebar à rester visible en mode général
  // useEffect(() => {
  //   if (currentProject === 'general' && !isSidebarVisible) {
  //     setIsSidebarVisible(true);
  //   }
  // }, [currentProject, isSidebarVisible]);

  return (
    <div 
      className="flex h-screen transition-all duration-300"
      style={{
        backgroundColor: isDarkMode ? '#000000' : '#f8fafc'
      }}
    >
      
      {/* Sidebar */}
      <div className={`${isSidebarVisible ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden`}>
        {isSidebarVisible && (
          <div 
            className="w-80 h-full flex flex-col border-r transition-all duration-300"
            style={{
              backgroundColor: isDarkMode ? '#111111' : '#ffffff',
              borderColor: isDarkMode ? '#2a2a2a' : '#e2e8f0'
            }}
          >
            
            {/* Header */}
            <div 
              className="p-6 border-b transition-all duration-300"
              style={{
                borderColor: isDarkMode ? '#2a2a2a' : '#e2e8f0'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)'
                    }}
                  >
                    <img 
                      src={isDarkMode ? '/images/B-light.png' : '/images/B-dark.png'}
                      alt="Brain Invest Logo"
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = document.createElement('span');
                        fallback.className = 'text-xl font-bold text-white';
                        fallback.textContent = 'B';
                        e.target.parentElement.appendChild(fallback);
                      }}
                    />
                  </div>
                  <div>
                    <h1 
                      className="text-xl font-bold"
                      style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}
                    >
                      Brain Invest
                    </h1>
                    <p 
                      className="text-sm"
                      style={{ color: isDarkMode ? '#a3a3a3' : '#64748b' }}
                    >
                      Assistant Trading IA
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg transition-all duration-200"
                  style={{
                    color: isDarkMode ? '#a3a3a3' : '#64748b',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = isDarkMode ? '#2a2a2a' : '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* User Profile */}
            <div 
              className="p-4 border-b transition-all duration-300"
              style={{
                borderColor: isDarkMode ? '#2a2a2a' : '#e2e8f0'
              }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)'
                  }}
                >
                  <span className="text-sm font-bold text-white">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium truncate"
                    style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}
                  >
                    {user.firstName} {user.lastName}
                  </p>
                  <p 
                    className="text-xs truncate"
                    style={{ color: isDarkMode ? '#a3a3a3' : '#64748b' }}
                  >
                    {user.email}
                  </p>
                </div>
                
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg transition-all duration-200"
                  style={{
                    color: isDarkMode ? '#fbbf24' : '#64748b',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = isDarkMode ? '#2a2a2a' : '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                  title={`Passer au mode ${isDarkMode ? 'clair' : 'sombre'}`}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                <button
                  onClick={onLogout}
                  className="p-1 rounded transition-all duration-200"
                  style={{
                    color: '#ef4444',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                  title="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              {isAdmin && (
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                  style={{
                    backgroundColor: '#0d9488'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#14b8a6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#0d9488';
                  }}
                >
                  <Shield className="h-4 w-4" />
                  <span>Retour Dashboard Admin</span>
                </button>
              )}
            </div>

            {/* Project Selection */}
            <div 
              className="p-4 border-b transition-all duration-300"
              style={{
                borderColor: isDarkMode ? '#2a2a2a' : '#e2e8f0'
              }}
            >
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setCurrentProject('general');
                    setIsSidebarVisible(true);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentProject === 'general' ? 'font-medium' : ''
                  }`}
                  style={{
                    backgroundColor: currentProject === 'general' 
                      ? (isDarkMode ? '#0d2926' : '#f0fdfa')
                      : 'transparent',
                    color: currentProject === 'general' 
                      ? '#0d9488' 
                      : (isDarkMode ? '#a3a3a3' : '#64748b')
                  }}
                  onMouseEnter={(e) => {
                    if (currentProject !== 'general') {
                      e.target.style.backgroundColor = isDarkMode ? '#2a2a2a' : '#f1f5f9';
                      e.target.style.color = isDarkMode ? '#ffffff' : '#0f172a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentProject !== 'general') {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = isDarkMode ? '#a3a3a3' : '#64748b';
                    }
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Général</span>
                </button>
                
                <button
                  onClick={() => {
                    setCurrentProject('trading');
                    setIsSidebarVisible(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentProject === 'trading' ? 'font-medium' : ''
                  }`}
                  style={{
                    backgroundColor: currentProject === 'trading' 
                      ? (isDarkMode ? '#0d2926' : '#f0fdfa')
                      : 'transparent',
                    color: currentProject === 'trading' 
                      ? '#0d9488' 
                      : (isDarkMode ? '#a3a3a3' : '#64748b')
                  }}
                  onMouseEnter={(e) => {
                    if (currentProject !== 'trading') {
                      e.target.style.backgroundColor = isDarkMode ? '#2a2a2a' : '#f1f5f9';
                      e.target.style.color = isDarkMode ? '#ffffff' : '#0f172a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentProject !== 'trading') {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = isDarkMode ? '#a3a3a3' : '#64748b';
                    }
                  }}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Trading Analysis</span>
                </button>
              </div>
            </div>

            {/* New Conversation Button */}
            <div 
              className="p-4 border-b transition-all duration-300"
              style={{
                borderColor: isDarkMode ? '#2a2a2a' : '#e2e8f0'
              }}
            >
              <button 
                onClick={() => createNewConversation(null, currentProject, true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-white rounded-lg transition-all duration-200 font-medium shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(13, 148, 136, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(13, 148, 136, 0.1)';
                }}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Nouvelle conversation</span>
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {conversations.length > 0 ? (
                conversations.map(conversation => (
                  <div
                    key={conversation._id || conversation.id}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      (activeConversation?._id || activeConversation?.id) === (conversation._id || conversation.id)
                        ? 'border'
                        : ''
                    }`}
                    style={{
                      backgroundColor: (activeConversation?._id || activeConversation?.id) === (conversation._id || conversation.id)
                        ? (isDarkMode ? '#0d2926' : '#f0fdfa')
                        : 'transparent',
                      borderColor: (activeConversation?._id || activeConversation?.id) === (conversation._id || conversation.id)
                        ? '#0d9488'
                        : 'transparent'
                    }}
                    onClick={() => setActiveConversation(conversation)}
                    onMouseEnter={(e) => {
                      if ((activeConversation?._id || activeConversation?.id) !== (conversation._id || conversation.id)) {
                        e.target.style.backgroundColor = isDarkMode ? '#2a2a2a' : '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if ((activeConversation?._id || activeConversation?.id) !== (conversation._id || conversation.id)) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm font-medium truncate"
                        style={{ 
                          color: (activeConversation?._id || activeConversation?.id) === (conversation._id || conversation.id)
                            ? '#0d9488'
                            : (isDarkMode ? '#ffffff' : '#0f172a')
                        }}
                      >
                        {conversation.title}
                      </p>
                      <p 
                        className="text-xs truncate"
                        style={{ color: isDarkMode ? '#a3a3a3' : '#64748b' }}
                      >
                        {conversation.lastMessage || 'Nouvelle conversation'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Supprimer cette conversation ?')) {
                          deleteConversation(conversation._id || conversation.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200"
                      style={{
                        color: '#ef4444'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                      title="Supprimer la conversation"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div 
                  className="text-center text-sm"
                  style={{ color: isDarkMode ? '#666666' : '#94a3b8' }}
                >
                  Aucune conversation
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Floating Menu Button */}
        {!isSidebarVisible && (
          <div className="fixed top-4 left-4 z-20 flex items-center space-x-2">
            <button
              onClick={toggleSidebar}
              className="p-3 rounded-lg shadow-lg transition-all duration-200"
              style={{
                backgroundColor: isDarkMode ? '#111111' : '#ffffff',
                borderColor: isDarkMode ? '#2a2a2a' : '#e2e8f0',
                color: isDarkMode ? '#ffffff' : '#0f172a'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Project Indicator */}
            <div 
              className="px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2"
              style={{
                backgroundColor: isDarkMode ? '#111111' : '#ffffff',
                borderColor: isDarkMode ? '#2a2a2a' : '#e2e8f0'
              }}
            >
              {currentProject === 'trading' ? (
                <>
                  <TrendingUp className="h-4 w-4" style={{ color: '#0d9488' }} />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}
                  >
                    Trading Analysis
                  </span>
                </>
              ) : (
                <>
                  <MessageCircle 
                    className="h-4 w-4"
                    style={{ color: isDarkMode ? '#a3a3a3' : '#64748b' }}
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}
                  >
                    Général
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden">
          <ResizableChatContainer 
            currentProject={currentProject}
            showTradingPanel={currentProject === 'trading'}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;