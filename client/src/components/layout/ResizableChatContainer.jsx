// src/components/layout/ResizableChatContainer.jsx - Version avec splitter redimensionnable
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useChatContext } from '../../context/ChatContext';
import AnalysisPanel from '../trading/AnalysisPanel';

const ResizableChatContainer = ({ currentProject, showTradingPanel, isDarkMode }) => {
  const { activeConversation, sendMessage, isThinking } = useChatContext();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const splitterRef = useRef(null);
  const containerRef = useRef(null);

  const [message, setMessage] = useState('');
  const [leftWidth, setLeftWidth] = useState(50); // Pourcentage pour le chat
  const [isResizing, setIsResizing] = useState(false);

  // Gestion du redimensionnement
  const handleMouseDown = useCallback((e) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limiter entre 30% et 70%
    const clampedWidth = Math.max(30, Math.min(70, newLeftWidth));
    setLeftWidth(clampedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

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

  // Styles dynamiques
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

  // Style du splitter
  const splitterStyle = {
    backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
    cursor: 'col-resize',
    position: 'relative'
  };

  return (
    <div ref={containerRef} className="flex h-full relative">
      
      {/* Zone de chat - largeur dynamique */}
      <div 
        className="flex flex-col h-full"
        style={{ width: showTradingPanel ? `${leftWidth}%` : '100%' }}
      >
        
        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto"
          style={chatBackgroundStyle}
        >
          <div className="max-w-none px-4 py-6 space-y-6">
            
            {/* Messages de conversation */}
            {activeConversation?.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-full p-4 rounded-2xl border"
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
                  
                  <div className="text-sm leading-relaxed">
                    {/* Formatter le markdown */}
                    {msg.content.split('\n').map((line, lineIndex) => {
                      if (line.startsWith('## ')) {
                        return (
                          <h2 
                            key={lineIndex} 
                            className="text-lg font-bold mt-4 mb-2"
                            style={{ color: '#0d9488' }}
                          >
                            {line.replace('## ', '')}
                          </h2>
                        );
                      } else if (line.startsWith('### ')) {
                        return (
                          <h3 key={lineIndex} className="text-md font-semibold mt-3 mb-2">
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
                          <p key={lineIndex} className="ml-2 mb-1">
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

        {/* Zone de saisie */}
        <div 
          className="border-t"
          style={inputContainerStyle}
        >
          
          {/* Suggestions rapides */}
          {(!activeConversation?.messages || activeConversation.messages.length <= 1) && !message && (
            <div 
              className="px-4 py-2 border-b"
              style={{ borderColor: isDarkMode ? '#333333' : '#f3f4f6' }}
            >
              <p 
                className="text-sm mb-2"
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
              >
                Suggestions rapides :
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setMessage(suggestion.text);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="inline-flex items-center space-x-1 px-2 py-1 text-white rounded-full text-xs font-medium hover:scale-105 transition-transform"
                    style={{ 
                      background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                      boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)'
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
          <form onSubmit={handleSubmit} className="p-4">
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
              />
              
              <button
                type="submit"
                disabled={!message.trim() || isThinking}
                className="px-4 py-2 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed hover:scale-105 active:scale-95 disabled:hover:scale-100 text-sm"
                style={{
                  background: !message.trim() || isThinking 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  boxShadow: !message.trim() || isThinking 
                    ? 'none' 
                    : '0 4px 6px rgba(13, 148, 136, 0.2)'
                }}
              >
                {isThinking ? 'Analyse...' : 'Envoyer'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Splitter redimensionnable */}
      {showTradingPanel && (
        <div
          ref={splitterRef}
          className="w-1 hover:w-2 transition-all duration-200 group"
          style={splitterStyle}
          onMouseDown={handleMouseDown}
        >
          {/* Indicateur visuel du splitter */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-0.5 h-8 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: isDarkMode ? '#6b7280' : '#9ca3af' }}
            ></div>
          </div>
          
          {/* Zone de grip élargie pour faciliter la saisie */}
          <div className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize"></div>
        </div>
      )}

      {/* Panneau Trading - largeur dynamique */}
      {showTradingPanel && (
        <div 
          className="flex-shrink-0 border-l"
          style={{ 
            width: `${100 - leftWidth}%`,
            borderColor: isDarkMode ? '#333333' : '#e5e7eb'
          }}
        >
          <AnalysisPanel 
            currentMessage={activeConversation?.messages?.filter(m => m.role === 'user').pop()?.content || ''} 
          />
        </div>
      )}
    </div>
  );
};

export default ResizableChatContainer;