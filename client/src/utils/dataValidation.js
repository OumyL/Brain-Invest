/**
 * Utilitaires de validation des données pour éviter les erreurs runtime
 */

/**
 * Valide qu'une conversation a la structure correcte
 */
export const validateConversation = (conversation) => {
  if (!conversation || typeof conversation !== 'object') {
    return false;
  }
  
  const requiredFields = ['id', 'title', 'messages'];
  const hasRequiredFields = requiredFields.every(field => 
    conversation.hasOwnProperty(field)
  );
  
  if (!hasRequiredFields) {
    return false;
  }
  
  // Vérifier que messages est un tableau
  if (!Array.isArray(conversation.messages)) {
    return false;
  }
  
  // Vérifier chaque message
  const validMessages = conversation.messages.every(msg => 
    msg && 
    typeof msg === 'object' && 
    msg.id && 
    msg.content && 
    msg.role && 
    ['user', 'assistant'].includes(msg.role)
  );
  
  return validMessages;
};

/**
 * Répare une conversation en lui donnant une structure valide
 */
export const repairConversation = (conversation) => {
  if (!conversation || typeof conversation !== 'object') {
    return null;
  }
  
  return {
    id: conversation.id || Date.now(),
    title: conversation.title || 'Conversation sans titre',
    date: conversation.date || new Date().toISOString(),
    updatedAt: conversation.updatedAt || conversation.date || new Date().toISOString(),
    lastMessage: conversation.lastMessage || '',
    projectId: conversation.projectId || 'default',
    messages: Array.isArray(conversation.messages) 
      ? conversation.messages.filter(msg => 
          msg && 
          typeof msg === 'object' && 
          msg.content && 
          msg.role
        ).map(msg => ({
          id: msg.id || Date.now() + Math.random(),
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
          model: msg.model || 'unknown'
        }))
      : []
  };
};

/**
 * Valide et répare un tableau de conversations
 */
export const validateAndRepairConversations = (conversations) => {
  if (!Array.isArray(conversations)) {
    return [];
  }
  
  return conversations
    .map(conv => repairConversation(conv))
    .filter(conv => conv !== null && validateConversation(conv));
};

/**
 * Valide qu'un message a la structure correcte
 */
export const validateMessage = (message) => {
  return (
    message &&
    typeof message === 'object' &&
    message.id &&
    message.content &&
    message.role &&
    ['user', 'assistant'].includes(message.role)
  );
};

/**
 * Crée un message par défaut valide
 */
export const createDefaultMessage = (role = 'assistant', content = '', currentUser = null) => {
  const userName = currentUser?.firstName || 'Utilisateur';
  const userRole = currentUser?.role;
  
  let defaultContent = content;
  if (!defaultContent) {
    if (role === 'assistant') {
      if (userRole === 'teacher') {
        defaultContent = `Bonjour Professeur ${userName} ! Comment puis-je vous assister aujourd'hui ?`;
      } else {
        defaultContent = `Bonjour ${userName} ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?`;
      }
    } else {
      defaultContent = 'Message utilisateur';
    }
  }
  
  return {
    id: Date.now() + Math.random(),
    role,
    content: defaultContent,
    timestamp: new Date().toISOString(),
    model: 'default'
  };
};

/**
 * Valide qu'un projet a la structure correcte
 */
export const validateProject = (project) => {
  return (
    project &&
    typeof project === 'object' &&
    project.id &&
    project.name
  );
};

/**
 * Répare un projet en lui donnant une structure valide
 */
export const repairProject = (project) => {
  if (!project || typeof project !== 'object') {
    return null;
  }
  
  return {
    id: project.id || Date.now().toString(),
    name: project.name || 'Projet sans nom',
    description: project.description || '',
    color: project.color || '#3a97c9',
    createdAt: project.createdAt || new Date().toISOString(),
    conversationIds: Array.isArray(project.conversationIds) 
      ? project.conversationIds 
      : []
  };
};

/**
 * Fonction de diagnostic complet
 */
export const performFullDiagnostic = () => {
  const results = {
    conversations: { status: 'unknown', issues: [], count: 0 },
    projects: { status: 'unknown', issues: [], count: 0 },
    user: { status: 'unknown', issues: [] }
  };
  
  try {
    // Vérifier les conversations
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const conversations = JSON.parse(savedConversations);
      if (Array.isArray(conversations)) {
        results.conversations.count = conversations.length;
        const invalidConversations = conversations.filter(conv => !validateConversation(conv));
        
        if (invalidConversations.length > 0) {
          results.conversations.status = 'invalid';
          results.conversations.issues = [
            `${invalidConversations.length} conversations invalides détectées`
          ];
        } else {
          results.conversations.status = 'valid';
        }
      } else {
        results.conversations.status = 'invalid';
        results.conversations.issues = ['Les conversations ne sont pas un tableau'];
      }
    } else {
      results.conversations.status = 'empty';
    }
    
    // Vérifier les projets
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      if (Array.isArray(projects)) {
        results.projects.count = projects.length;
        const invalidProjects = projects.filter(proj => !validateProject(proj));
        
        if (invalidProjects.length > 0) {
          results.projects.status = 'invalid';
          results.projects.issues = [
            `${invalidProjects.length} projets invalides détectés`
          ];
        } else {
          results.projects.status = 'valid';
        }
      } else {
        results.projects.status = 'invalid';
        results.projects.issues = ['Les projets ne sont pas un tableau'];
      }
    } else {
      results.projects.status = 'empty';
    }
    
    // Vérifier le profil utilisateur
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user && typeof user === 'object' && user.firstName && user.email) {
        results.user.status = 'valid';
      } else {
        results.user.status = 'invalid';
        results.user.issues = ['Profil utilisateur incomplet'];
      }
    } else {
      results.user.status = 'empty';
    }
    
  } catch (error) {
    console.error('Erreur lors du diagnostic:', error);
  }
  
  return results;
};

// Exposer les fonctions globalement pour le débogage
if (typeof window !== 'undefined') {
  window.validateConversation = validateConversation;
  window.repairConversation = repairConversation;
  window.validateAndRepairConversations = validateAndRepairConversations;
  window.performFullDiagnostic = performFullDiagnostic;
}


