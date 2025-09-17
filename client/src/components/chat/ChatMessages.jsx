import React, { useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { ThemeContext } from '../../context/ThemeContext';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';
import { useChatInteraction } from '../../hooks/useChatInteraction';

const ChatMessages = () => {
  const { activeConversation, isThinking } = useContext(ChatContext);
  const { isDark } = useContext(ThemeContext);
  const { messagesEndRef } = useChatInteraction();

  // Choisir le logo en fonction du thème
  const logoSrc = isDark ? '/images/brain-logo-d.png' : '/images/brain-logo-l.jpeg';

  // Vérifier si on doit afficher l'écran d'accueil
  const shouldShowWelcome = !activeConversation || 
    !activeConversation.messages || 
    !Array.isArray(activeConversation.messages) ||
    activeConversation.messages.length === 0;

  if (shouldShowWelcome) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="glass-card text-center max-w-md p-6 animate-fade-in">
          {/* Logo beaucoup plus grand sur l'écran d'accueil */}
          <div className="mx-auto mb-8 max-w-sm w-full">
            <img 
              src={logoSrc}
              alt="MR ComSup Logo" 
              className="w-full h-auto max-h-60 object-contain mx-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                // Si l'image ne charge pas, afficher le cercle avec B
                const fallback = document.getElementById('fallback-circle');
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }} 
            />
            <div 
              id="fallback-circle"
              className="w-40 h-40 rounded-full bg-gradient-to-br from-brand-blue to-blue-500 flex items-center justify-center text-white text-6xl font-bold mx-auto shadow-xl"
              style={{display: 'none'}} // Caché par défaut
            >
              M
            </div>
          </div>
          
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Bonjour et bienvenue à Brain Invest ! Je suis votre assistant Tradong officiel. Comment puis-je vous aider aujourd'hui ?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 md:px-6 py-4 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Messages de la conversation */}
        {activeConversation.messages.map((message, index) => (
          <div key={message.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <MessageBubble message={message} />
          </div>
        ))}
        
        {isThinking && <ThinkingIndicator />}
        
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
};

export default ChatMessages;
