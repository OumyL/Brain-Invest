// Utilitaires pour réparer et migrer les conversations existantes

// Fonction pour réparer les conversations corrompues
export const repairConversations = () => {
  try {
    const conversations = JSON.parse(localStorage.getItem('brain-agent-conversations') || '[]');
    let repaired = false;

    const repairedConversations = conversations.map(conversation => {
      let conv = { ...conversation };
      
      // Réparer les conversations sans ID
      if (!conv.id) {
        conv.id = `conversation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        repaired = true;
      }

      // Réparer les conversations sans titre
      if (!conv.title) {
        conv.title = conv.messages && conv.messages.length > 0 
          ? `Conversation ${conv.messages[0].content?.substring(0, 30)}...`
          : 'Nouvelle conversation';
        repaired = true;
      }

      // Réparer les conversations sans timestamp
      if (!conv.createdAt) {
        conv.createdAt = new Date().toISOString();
        repaired = true;
      }

      if (!conv.updatedAt) {
        conv.updatedAt = conv.createdAt;
        repaired = true;
      }

      // Réparer les messages sans ID
      if (conv.messages && Array.isArray(conv.messages)) {
        conv.messages = conv.messages.map((message, index) => {
          let msg = { ...message };
          
          if (!msg.id) {
            msg.id = `message-${Date.now()}-${index}`;
            repaired = true;
          }

          if (!msg.timestamp) {
            msg.timestamp = new Date().toISOString();
            repaired = true;
          }

          // Assurer que le rôle est défini
          if (!msg.role) {
            msg.role = index % 2 === 0 ? 'user' : 'assistant';
            repaired = true;
          }

          return msg;
        });
      } else {
        conv.messages = [];
        repaired = true;
      }

      // Ajouter les métadonnées manquantes
      if (!conv.model) {
        conv.model = 'gpt-3.5-turbo';
        repaired = true;
      }

      if (!conv.provider) {
        conv.provider = 'openai';
        repaired = true;
      }

      // Ajouter projectId si manquant
      if (!conv.projectId) {
        conv.projectId = 'default';
        repaired = true;
      }

      return conv;
    });

    // Sauvegarder si des réparations ont été effectuées
    if (repaired) {
      localStorage.setItem('brain-agent-conversations', JSON.stringify(repairedConversations));
      console.log('Conversations réparées et sauvegardées');
    }

    return repairedConversations;
  } catch (error) {
    console.error('Erreur lors de la réparation des conversations:', error);
    // En cas d'erreur, retourner un tableau vide
    localStorage.setItem('brain-agent-conversations', '[]');
    return [];
  }
};

// Fonction pour nettoyer les conversations dupliquées
export const removeDuplicateConversations = () => {
  try {
    const conversations = JSON.parse(localStorage.getItem('brain-agent-conversations') || '[]');
    const uniqueConversations = [];
    const seenIds = new Set();

    conversations.forEach(conv => {
      if (!seenIds.has(conv.id)) {
        seenIds.add(conv.id);
        uniqueConversations.push(conv);
      }
    });

    if (uniqueConversations.length !== conversations.length) {
      localStorage.setItem('brain-agent-conversations', JSON.stringify(uniqueConversations));
      console.log(`${conversations.length - uniqueConversations.length} conversations dupliquées supprimées`);
    }

    return uniqueConversations;
  } catch (error) {
    console.error('Erreur lors de la suppression des doublons:', error);
    return [];
  }
};

// Fonction pour migrer vers la nouvelle structure de données
export const migrateConversationsFormat = () => {
  try {
    const conversations = JSON.parse(localStorage.getItem('brain-agent-conversations') || '[]');
    let migrated = false;

    const migratedConversations = conversations.map(conv => {
      let conversation = { ...conv };

      // Migration vers la nouvelle structure de métadonnées
      if (!conversation.metadata) {
        conversation.metadata = {
          tokenCount: 0,
          estimatedCost: 0,
          tags: [],
          starred: false
        };
        migrated = true;
      }

      // Migration des anciens formats de messages
      if (conversation.messages && Array.isArray(conversation.messages)) {
        conversation.messages = conversation.messages.map(msg => {
          let message = { ...msg };

          // Assurer la structure correcte des messages
          if (typeof message.content === 'object' && message.content !== null) {
            // Convertir l'ancien format en chaîne de caractères
            message.content = JSON.stringify(message.content);
            migrated = true;
          }

          // Ajouter les métadonnées de message si manquantes
          if (!message.metadata) {
            message.metadata = {
              tokenCount: message.content ? message.content.length / 4 : 0, // Estimation simple
              processingTime: 0
            };
            migrated = true;
          }

          return message;
        });
      }

      return conversation;
    });

    if (migrated) {
      localStorage.setItem('brain-agent-conversations', JSON.stringify(migratedConversations));
      console.log('Format des conversations migré');
    }

    return migratedConversations;
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    return [];
  }
};

// Fonction principale pour effectuer toutes les réparations
export const performFullRepair = () => {
  console.log('Début de la réparation des conversations...');
  
  // Étape 1: Réparer les conversations de base
  repairConversations();
  
  // Étape 2: Supprimer les doublons
  removeDuplicateConversations();
  
  // Étape 3: Migrer vers le nouveau format
  const migrated = migrateConversationsFormat();
  
  console.log('Réparation des conversations terminée');
  return migrated;
};

// Auto-exécution des réparations au chargement
if (typeof window !== 'undefined') {
  // Vérifier si les réparations sont nécessaires
  const needsRepair = () => {
    try {
      const conversations = JSON.parse(localStorage.getItem('brain-agent-conversations') || '[]');
      
      // Vérifier s'il y a des conversations sans ID ou avec d'autres problèmes
      return conversations.some(conv => 
        !conv.id || 
        !conv.title || 
        !conv.createdAt || 
        !conv.messages ||
        !Array.isArray(conv.messages) ||
        !conv.metadata
      );
    } catch {
      return true;
    }
  };

  // Effectuer les réparations si nécessaire
  if (needsRepair()) {
    performFullRepair();
  }
}

const conversationRepairUtils = {
  repairConversations,
  removeDuplicateConversations,
  migrateConversationsFormat,
  performFullRepair
};

export default conversationRepairUtils;
