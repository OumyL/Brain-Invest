// src/components/layout/ChatContainer.jsx - Version avec noir pur forcé
import React, { useRef, useEffect } from 'react';
import { useChatContext } from '../../context/ChatContext';
import AnalysisPanel from '../trading/AnalysisPanel';

const ChatContainer = ({ currentProject, showTradingPanel, splitView }) => {
  const { activeConversation, sendMessage, isThinking } = useChatContext();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [message, setMessage] = React.useState('');

  // Détecter le mode sombre
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Injecter les styles de scrollbar personnalisée
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: ${isDarkMode ? '#1a1a1a' : '#f1f5f9'};
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #0d9488;
        border-radius: 4px;
        border: 2px solid ${isDarkMode ? '#1a1a1a' : '#f1f5f9'};
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #14b8a6;
      }
      .custom-scrollbar::-webkit-scrollbar-corner {
        background: ${isDarkMode ? '#1a1a1a' : '#f1f5f9'};
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [isDarkMode]);

  // Écouter les changements de thème
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isThinking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isThinking) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestions = [
    { text: "Analyse BTC", icon: "₿", gradient: "from-orange-400 to-orange-600" },
    { text: "Comment va AAPL?", icon: "🍎", gradient: "from-gray-400 to-gray-600" },
    { text: "TSLA tendance", icon: "🚗", gradient: "from-red-400 to-red-600" },
    { text: "ETH analyse technique", icon: "⟠", gradient: "from-blue-400 to-blue-600" },
    { text: "NVDA recommandation", icon: "🎮", gradient: "from-green-400 to-green-600" }
  ];

  // Styles dynamiques pour forcer les couleurs
  const chatBackgroundStyle = {
    backgroundColor: isDarkMode ? '#000000' : '#f9fafb'
  };

  const messageAssistantStyle = {
    backgroundColor: isDarkMode ? '#111111' : '#ffffff',
    borderColor: isDarkMode ? '#333333' : '#e5e7eb',
    color: isDarkMode ? '#ffffff' : '#1f2937'
  };

  const inputContainerStyle = {
    backgroundColor: isDarkMode ? '#111111' : '#ffffff',
    borderColor: isDarkMode ? '#333333' : '#e5e7eb'
  };

  const inputStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb',
    borderColor: isDarkMode ? '#404040' : '#d1d5db',
    color: isDarkMode ? '#ffffff' : '#111827'
  };

  return (
    <div className="flex h-full">
      {/* Zone de chat - 50% en mode trading, 100% sinon */}
      <div className={`flex flex-col h-full ${showTradingPanel ? 'w-1/2' : 'w-full'}`}>
        
        {/* Messages - Noir pur forcé */}
        <div 
          className="flex-1 overflow-y-auto"
          style={chatBackgroundStyle}
        >
          <div className={`${showTradingPanel ? 'max-w-none px-4' : 'max-w-4xl mx-auto px-6'} py-6 space-y-6`}>
            
            {/* Messages de conversation */}
            {activeConversation?.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`${showTradingPanel ? 'max-w-full' : 'max-w-3xl'} p-4 rounded-2xl ${
                    msg.role !== 'user' ? 'border' : ''
                  }`}
                  style={{
                    backgroundColor: msg.role === 'user' ? '#0d9488' : messageAssistantStyle.backgroundColor,
                    borderColor: msg.role !== 'user' ? messageAssistantStyle.borderColor : undefined,
                    color: msg.role === 'user' ? '#ffffff' : messageAssistantStyle.color
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-3">
                      <div 
                        className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-md"
                        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' }}
                      >
                        <img
                          src={isDarkMode ? "/images/B-light.png" : "/images/B-dark.png"}
                          alt="Brain Invest Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span 
                        className="text-sm font-semibold"
                        style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}
                      >
                        Brain Invest
                      </span>
                      {msg.analysis && (
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: isDarkMode ? '#0d2926' : '#f0fdfa',
                            color: '#0d9488'
                          }}
                        >
                          Analyse IA
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className={`${showTradingPanel ? 'text-sm' : 'text-sm'} leading-relaxed`}>
                    {/* Formatter le markdown */}
                    {msg.content.split('\n').map((line, lineIndex) => {
                      if (line.startsWith('## ')) {
                        return (
                          <h2 
                            key={lineIndex} 
                            className={`${showTradingPanel ? 'text-lg' : 'text-xl'} font-bold mt-4 mb-2`}
                            style={{ color: '#0d9488' }}
                          >
                            {line.replace('## ', '')}
                          </h2>
                        );
                      } else if (line.startsWith('### ')) {
                        return (
                          <h3 key={lineIndex} className={`${showTradingPanel ? 'text-md' : 'text-lg'} font-semibold mt-3 mb-2`}>
                            {line.replace('### ', '')}
                          </h3>
                        );
                      } else if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={lineIndex} className="font-semibold mb-1">
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      } else if (line.startsWith('• ')) {
                        return (
                          <p key={lineIndex} className={`${showTradingPanel ? 'ml-2' : 'ml-4'} mb-1`}>
                            {line}
                          </p>
                        );
                      } else if (line.trim()) {
                        return (
                          <p key={lineIndex} className="mb-2">
                            {line}
                          </p>
                        );
                      }
                      return <br key={lineIndex} />;
                    })}
                  </div>
                  
                  <div 
                    className="text-xs opacity-70 mt-2"
                    style={{ color: msg.role === 'user' ? '#ffffff' : (isDarkMode ? '#9ca3af' : '#6b7280') }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}

            {/* Animation de réflexion */}
            {isThinking && (
              <div className="flex justify-start">
                <div 
                  className="p-4 rounded-2xl border"
                  style={{
                    backgroundColor: messageAssistantStyle.backgroundColor,
                    borderColor: messageAssistantStyle.borderColor
                  }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' }}
                    >
                      <span className="text-xs font-bold text-white">🧠</span>
                    </div>
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}
                    >
                      Brain Invest
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div 
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: '#0d9488' }}
                      ></div>
                      <div 
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: '#0d9488', animationDelay: '0.1s' }}
                      ></div>
                      <div 
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: '#0d9488', animationDelay: '0.2s' }}
                      ></div>
                    </div>
                    <span 
                      className="text-sm"
                      style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    >
                      Analyse en cours...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Zone de saisie - Noir forcé */}
        <div 
          className="border-t"
          style={inputContainerStyle}
        >
          
          {/* Suggestions rapides */}
          {(!activeConversation?.messages || activeConversation.messages.length <= 1) && !message && (
            <div 
              className={`${showTradingPanel ? 'px-4 py-2' : 'px-6 py-4'} border-b`}
              style={{ borderColor: isDarkMode ? '#333333' : '#f3f4f6' }}
            >
              <p 
                className="text-sm mb-2"
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
              >
                Suggestions rapides :
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, showTradingPanel ? 3 : 5).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setMessage(suggestion.text);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className={`inline-flex items-center space-x-1 px-2 py-1 text-white rounded-full ${showTradingPanel ? 'text-xs' : 'text-sm'} font-medium hover:scale-105 transition-transform`}
                    style={{ 
                      background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                      boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)';
                    }}
                  >
                    <span>{suggestion.icon}</span>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input principal */}
          <form onSubmit={handleSubmit} className={showTradingPanel ? 'p-4' : 'p-6'}>
            <div className="flex space-x-3">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isThinking ? "Brain Invest réfléchit..." : "Posez votre question"}
                disabled={isThinking}
                className="flex-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 transition-all text-sm"
                style={{
                  ...inputStyle,
                  '--tw-ring-color': '#0d9488'
                }}
                rows="1"
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0d9488';
                  e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputStyle.borderColor;
                  e.target.style.boxShadow = 'none';
                }}
              />
              
              <button
                type="submit"
                disabled={!message.trim() || isThinking}
                className={`${showTradingPanel ? 'px-4 py-2' : 'px-6 py-3'} text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed hover:scale-105 active:scale-95 disabled:hover:scale-100 text-sm`}
                style={{
                  background: !message.trim() || isThinking 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  boxShadow: !message.trim() || isThinking 
                    ? 'none' 
                    : '0 4px 6px rgba(13, 148, 136, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!(!message.trim() || isThinking)) {
                    e.target.style.background = 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!message.trim() || isThinking)) {
                    e.target.style.background = 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)';
                  }
                }}
              >
                {isThinking ? 'Analyse...' : 'Envoyer'}
              </button>
            </div>
            
            {/* Indicateurs de statut */}
            <div className="flex items-center justify-between mt-2 text-xs">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <div 
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: '#22c55e' }}
                  ></div>
                  <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Système OK</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#0d9488' }}
                  ></div>
                  <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>MCP actif</span>
                </div>
                {showTradingPanel && (
                  <div className="flex items-center space-x-1">
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: '#8b5cf6' }}
                    ></div>
                    <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Trading</span>
                  </div>
                )}
              </div>
              <span 
                className="hidden sm:inline"
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
              >
                Entrée pour envoyer
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Panneau Trading - 50% de l'écran */}
      {showTradingPanel && (
        <div 
          className="w-1/2 border-l"
          style={{ borderColor: isDarkMode ? '#333333' : '#e5e7eb' }}
        >
          <AnalysisPanel currentMessage={activeConversation?.messages?.filter(m => m.role === 'user').pop()?.content || ''} />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;