import React from 'react';
import Avatar from '../ui/Avatar';

const MessageBubble = ({ message }) => {
  const { role, content, model, isError } = message;
  const isUser = role === 'user';

  // Fonction pour rendre les liens markdown cliquables
  const renderMessageContent = (text) => {
    if (!text) return text;
    
    // Regex pour détecter les liens markdown [texte](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = markdownLinkRegex.exec(text)) !== null) {
      // Ajouter le texte avant le lien
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Ajouter le lien cliquable
      parts.push(
        <a 
          key={match.index}
          href={match[2]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          {match[1]}
        </a>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Ajouter le texte restant
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && <Avatar role="assistant" />}
      
      <div className={`
        ${isUser ? 'user-bubble' : 'assistant-bubble'} 
        ${isError ? 'border-red-300 dark:border-red-700' : ''}
        transform transition-all ease-out
      `}>
        <div className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
          {renderMessageContent(content)}
        </div>
        
        {/* Afficher le modèle utilisé pour la réponse uniquement en cas d'erreur */}
        {!isUser && isError && model && (
          <div className="mt-3 text-xs text-red-500 dark:text-red-400 border-t border-neutral-200 dark:border-neutral-700 pt-2">
            Modèle: {model}
          </div>
        )}
      </div>
      
      {isUser && <Avatar role="user" />}
    </div>
  );
};

export default MessageBubble;
