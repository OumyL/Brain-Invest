import React, { useState, useRef, useEffect, useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { ThemeContext } from '../../context/ThemeContext';

const ConversationItemMinimal = ({ conversation, isActive, onClick }) => {
  const { deleteConversation, renameConversation } = useContext(ChatContext);
  const { isDark } = useContext(ThemeContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversation.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef(null);

  // Focus sur l'input quand on entre en mode édition
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== conversation.title) {
      renameConversation(conversation.id, editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditedTitle(conversation.title);
      setIsEditing(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteConversation(conversation.id);
    setShowDeleteConfirm(false);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  if (showDeleteConfirm) {
    return (
      <div className={`w-full p-2 rounded-lg border-2 border-red-500 ${
        isDark ? 'bg-red-900/20' : 'bg-red-50'
      }`}>
        <p className={`text-sm font-medium mb-2 ${
          isDark ? 'text-red-300' : 'text-red-700'
        }`}>
          Supprimer cette conversation ?
        </p>
        <div className="flex space-x-2">
          <button
            onClick={handleDelete}
            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
          >
            Supprimer
          </button>
          <button
            onClick={handleCancelDelete}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group w-full flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
        isActive
          ? (isDark ? 'bg-gray-900 text-white' : 'bg-blue-50 text-blue-700')
          : (isDark ? 'hover:bg-gray-900 text-gray-300' : 'hover:bg-gray-100 text-gray-600')
      }`}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex-1 min-w-0 mr-2">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
            className={`w-full text-sm bg-transparent border-b border-current focus:outline-none ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm truncate block">
            {conversation.title}
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {new Date(conversation.updatedAt || conversation.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit'
          })}
        </span>
        
        {/* Bouton supprimer - visible au hover */}
        <button
          onClick={handleDeleteClick}
          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
            isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-500'
          }`}
          title="Supprimer la conversation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ConversationItemMinimal;
