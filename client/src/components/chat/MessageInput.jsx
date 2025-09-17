// src/components/chat/MessageInput.jsx - Interface finale optimisée
import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '../../context/ChatContext';

const MessageInput = () => {
  const { sendMessage, isThinking } = useChatContext();
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef(null);

  const suggestions = [
    { text: "Analyse BTC", icon: "", color: "orange" },
    { text: "Comment va AAPL?", icon: "", color: "gray" },
    { text: "TSLA tendance", icon: "", color: "red" },
    { text: "ETH analyse technique", icon: "", color: "blue" },
    { text: "NVDA recommandation", icon: "", color: "green" }
  ];

  const handleSubmit = (text = null) => {
    const messageToSend = text || message;
    if (messageToSend.trim() && !isThinking) {
      sendMessage(messageToSend);
      setMessage('');
      setShowSuggestions(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.length === 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Suggestions rapides */}
      {showSuggestions && message.length === 0 && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Suggestions rapides:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSubmit(suggestion.text)}
                className={`
                  inline-flex items-center space-x-2 px-3 py-1.5 
                  bg-${suggestion.color}-50 hover:bg-${suggestion.color}-100 
                  dark:bg-${suggestion.color}-900/20 dark:hover:bg-${suggestion.color}-900/40
                  text-${suggestion.color}-700 dark:text-${suggestion.color}-300
                  rounded-full text-sm font-medium transition-all
                  hover:scale-105 active:scale-95
                `}
                disabled={isThinking}
              >
                <span>{suggestion.icon}</span>
                <span>{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={isThinking ? "Brain Invest réfléchit..." : "Posez votre question (ex: 'Analyse BTC', 'Comment va AAPL?')"}
                disabled={isThinking}
                className="
                  w-full px-4 py-3 pr-12 
                  border border-gray-300 dark:border-gray-600
                  rounded-xl resize-none
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
              
              {/* Indicateur de caractères */}
              <div className="absolute bottom-2 right-12 text-xs text-gray-400">
                {message.length}/500
              </div>
            </div>
          </div>

          {/* Bouton d'envoi */}
          <button
            onClick={() => handleSubmit()}
            disabled={!message.trim() || isThinking}
            className="
              flex items-center justify-center
              w-12 h-12 
              bg-blue-600 hover:bg-blue-700
              disabled:bg-gray-400 disabled:cursor-not-allowed
              text-white rounded-xl
              transition-all duration-200
              hover:scale-105 active:scale-95
              disabled:hover:scale-100
            "
          >
            {isThinking ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Indicateurs d'état */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Système opérationnel</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>MCP connecté</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>IA active</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            Appuyez sur Entrée pour envoyer
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;