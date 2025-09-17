// src/context/ChatContext.jsx - VERSION CORRIGÉE - Isolation complète par utilisateur
import React, { createContext, useContext, useState, useEffect } from 'react';
import detailedResponseService from '../services/detailedResponseService';

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // OBTENIR L'ID UTILISATEUR ACTUEL
  const getCurrentUserId = () => {
    try {
      const authData = localStorage.getItem('brain_invest_token');
      const userData = localStorage.getItem('brain_invest_user');
      
      if (authData && userData) {
        const user = JSON.parse(userData);
        return user.id?.toString();
      }
      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('brain_invest_token')}`,
    'Content-Type': 'application/json'
  });

  // CHARGER LES CONVERSATIONS AU DÉMARRAGE
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      setCurrentUserId(userId);
      loadConversations(userId);
    } else {
      setIsLoading(false);
    }
  }, []);

  // RÉINITIALISER QUAND L'UTILISATEUR CHANGE
  useEffect(() => {
    const checkUserChange = () => {
      const newUserId = getCurrentUserId();
      if (newUserId && newUserId !== currentUserId) {
        console.log(`User changed from ${currentUserId} to ${newUserId} - Reloading conversations`);
        setCurrentUserId(newUserId);
        setConversations([]);
        setActiveConversation(null);
        loadConversations(newUserId);
      }
    };

    const interval = setInterval(checkUserChange, 1000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const loadConversations = async (userId) => {
    if (!userId) {
      console.warn('No user ID provided for loading conversations');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Loading conversations for user: ${userId}`);
      
      const response = await fetch('http://localhost:3001/api/conversations', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Loaded ${data.length} conversations for user ${userId}`);
        
        // FILTRER UNIQUEMENT LES CONVERSATIONS NON-VIDES
        const validConversations = data.filter(conv => {
          const userMessages = conv.messages?.filter(msg => msg.role === 'user') || [];
          const hasUserInteraction = userMessages.length > 0;
          
          console.log(`Conversation ${conv._id}: ${userMessages.length} user messages, valid: ${hasUserInteraction}`);
          return hasUserInteraction;
        });
        
        setConversations(validConversations);
        
        // CRÉER UNE NOUVELLE CONVERSATION SEULEMENT SI AUCUNE EXISTE
        if (validConversations.length === 0) {
          await createNewConversation('Nouvelle session Brain Invest', 'trading', true);
        } else {
          // ACTIVER LA CONVERSATION LA PLUS RÉCENTE
          const mostRecent = validConversations[0];
          setActiveConversation(mostRecent);
        }
      } else {
        console.error('Failed to load conversations:', response.status);
        await createNewConversation('Nouvelle session Brain Invest', 'trading', true);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      await createNewConversation('Nouvelle session Brain Invest', 'trading', true);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async (title = null, projectId = 'trading', makeActive = false) => {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('Cannot create conversation: No user ID');
      return null;
    }

    const timestamp = new Date().toISOString();
    const welcomeMessage = {
      role: 'assistant',
      content: "## Bienvenue sur Brain Invest\n\nJe suis votre assistant de trading intelligent, spécialisé dans l'analyse technique et fondamentale des marchés financiers.\n\n### Pour commencer :\nMentionnez simplement le symbole qui vous intéresse :\n• \"Analyse BTC\"\n• \"Comment va AAPL ?\"\n• \"TSLA recommandation\"\n\n*Toutes les analyses sont fournies en temps réel.*",
      timestamp
    };

    const newConversation = {
      userId: userId, // IMPORTANT: Associer explicitement à l'utilisateur
      title: title || `Conversation ${conversations.length + 1}`,
      projectId,
      messages: [welcomeMessage],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    try {
      console.log(`Creating new conversation for user: ${userId}`);
      
      const response = await fetch('http://localhost:3001/api/conversations', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newConversation)
      });

      if (response.ok) {
        const savedConversation = await response.json();
        console.log(`Conversation created: ${savedConversation._id} for user ${userId}`);
        
        setConversations(prev => [savedConversation, ...prev]);
        
        if (makeActive) {
          setActiveConversation(savedConversation);
        }
        
        return savedConversation;
      } else {
        console.error('Failed to create conversation on server');
        return null;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const sendMessage = async (messageContent) => {
    if (!activeConversation || !messageContent.trim() || isThinking) return;

    const userId = getCurrentUserId();
    if (!userId) {
      console.error('Cannot send message: No user ID');
      return;
    }

    // VÉRIFIER QUE LA CONVERSATION APPARTIENT À L'UTILISATEUR ACTUEL
    if (activeConversation.userId && activeConversation.userId !== userId) {
      console.error('Conversation does not belong to current user!');
      await loadConversations(userId); // Recharger les bonnes conversations
      return;
    }

    const userMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...activeConversation.messages, userMessage];
    const updatedConversation = {
      ...activeConversation,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
      userId: userId // S'assurer que l'userId est toujours présent
    };

    setActiveConversation(updatedConversation);
    updateConversationInList(updatedConversation);

    setIsThinking(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const detailedResponse = await detailedResponseService.generateDetailedAnalysis(messageContent);
      
      const assistantMessage = {
        role: 'assistant',
        content: detailedResponse,
        timestamp: new Date().toISOString(),
        analysis: true
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const finalConversation = {
        ...updatedConversation,
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
        lastMessage: messageContent.substring(0, 50) + (messageContent.length > 50 ? '...' : ''),
        userId: userId
      };

      setActiveConversation(finalConversation);
      updateConversationInList(finalConversation);

      // SAUVEGARDER IMMÉDIATEMENT SUR LE SERVEUR
      await saveConversationToServer(finalConversation);

    } catch (error) {
      console.error('Error generating response:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: "Désolé, une erreur s'est produite lors de l'analyse. Le système est en cours de reconnexion...",
        timestamp: new Date().toISOString(),
        error: true
      };

      const errorConversation = {
        ...updatedConversation,
        messages: [...updatedMessages, errorMessage],
        updatedAt: new Date().toISOString(),
        userId: userId
      };

      setActiveConversation(errorConversation);
      updateConversationInList(errorConversation);
    } finally {
      setIsThinking(false);
    }
  };

  const saveConversationToServer = async (conversation) => {
    try {
      const response = await fetch(`http://localhost:3001/api/conversations/${conversation._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          messages: conversation.messages,
          updatedAt: conversation.updatedAt,
          lastMessage: conversation.lastMessage,
          userId: conversation.userId // Toujours inclure l'userId
        })
      });

      if (!response.ok) {
        console.error('Failed to save conversation to server:', response.status);
      }
    } catch (error) {
      console.error('Error saving conversation to server:', error);
    }
  };

  const updateConversationInList = (updatedConversation) => {
    setConversations(prev => 
      prev.map(conv => 
        (conv._id || conv.id) === (updatedConversation._id || updatedConversation.id) 
          ? updatedConversation 
          : conv
      )
    );
  };

  const deleteConversation = async (conversationId) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setConversations(prev => prev.filter(conv => (conv._id || conv.id) !== conversationId));
        
        // Si c'était la conversation active, créer une nouvelle
        if ((activeConversation?._id || activeConversation?.id) === conversationId) {
          await createNewConversation('Nouvelle session Brain Invest', 'trading', true);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const renameConversation = async (conversationId, newTitle) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/conversations/${conversationId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          title: newTitle,
          userId: userId // Assurer l'appartenance
        })
      });

      if (response.ok) {
        const updatedConversations = conversations.map(conv => 
          (conv._id || conv.id) === conversationId 
            ? { ...conv, title: newTitle, updatedAt: new Date().toISOString() }
            : conv
        );
        
        setConversations(updatedConversations);

        if ((activeConversation?._id || activeConversation?.id) === conversationId) {
          setActiveConversation(prev => ({ ...prev, title: newTitle }));
        }
      }
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  // NETTOYAGE LORS DU CHANGEMENT D'UTILISATEUR
  const clearUserData = () => {
    setConversations([]);
    setActiveConversation(null);
    setCurrentUserId(null);
  };

  const contextValue = {
    conversations,
    activeConversation,
    isThinking,
    isLoading,
    currentUserId,
    
    setActiveConversation,
    createNewConversation,
    sendMessage,
    deleteConversation,
    renameConversation,
    clearUserData,
    
    getMessageCount: () => activeConversation?.messages?.length || 0,
    hasSymbolInLastMessage: () => {
      const lastMessage = activeConversation?.messages?.filter(m => m.role === 'user').pop()?.content;
      if (!lastMessage) return false;
      
      const symbols = ['BTC', 'ETH', 'AAPL', 'TSLA', 'NVDA', 'GOOGL', 'MSFT', 'AMZN', 'META'];
      return symbols.some(symbol => 
        lastMessage.toUpperCase().includes(symbol)
      );
    },
    
    refreshConversations: () => {
      const userId = getCurrentUserId();
      if (userId) {
        loadConversations(userId);
      }
    }
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext };