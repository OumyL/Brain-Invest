// Script pour réinitialiser l'application exactement comme dans l'image cible
// Ouvrez la console du navigateur (F12) et collez ce script

console.log('🔄 Réinitialisation vers l\'état cible...');

// Nettoyer tout le localStorage
localStorage.clear();

// Créer l'utilisateur "Mounim zad" 
const targetUser = {
  firstName: 'Mounim',
  lastName: 'zad',
  email: 'mounim.zad@example.com',
  profilePicture: null,
  createdAt: new Date().toISOString()
};
localStorage.setItem('currentUser', JSON.stringify(targetUser));

// Créer les projets exactement comme dans l'image
const targetProjects = [
  {
    id: 'general',
    name: 'Général',
    description: 'Conversations générales',
    color: '#3a97c9',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ai-marketing',
    name: 'AI projects for Marketing',
    description: 'Projets IA pour le marketing',
    color: '#2563eb',
    createdAt: new Date().toISOString()
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Projets financiers',
    color: '#059669',
    createdAt: new Date().toISOString()
  },
  {
    id: 'crypto',
    name: 'Crytp',
    description: 'Projets crypto',
    color: '#dc2626',
    createdAt: new Date().toISOString()
  }
];
localStorage.setItem('brain-agent-projects', JSON.stringify(targetProjects));
localStorage.setItem('brain-agent-active-project', 'ai-marketing');

// Créer des conversations pour avoir les bons compteurs
const targetConversations = [
  // Général (9 conversations)
  ...Array.from({length: 9}, (_, i) => ({
    id: `general-${i + 1}`,
    title: `Conversation générale ${i + 1}`,
    projectId: 'general',
    messages: [
      {
        id: Date.now() + i,
        role: 'user',
        content: `Message dans conversation générale ${i + 1}`,
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date(Date.now() - (i * 1000 * 60 * 60)).toISOString()
  })),
  
  // AI projects for Marketing (4 conversations)
  ...Array.from({length: 4}, (_, i) => ({
    id: `ai-marketing-${i + 1}`,
    title: i === 0 ? 'Ai en blockchain' : `Conversation - AI projects for Marketing ${i + 1}`,
    projectId: 'ai-marketing',
    messages: [
      {
        id: Date.now() + 100 + i,
        role: 'user',
        content: `Message dans AI project ${i + 1}`,
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date(Date.now() - (i * 1000 * 60 * 60 * 2)).toISOString()
  })),
  
  // Finance (2 conversations)
  ...Array.from({length: 2}, (_, i) => ({
    id: `finance-${i + 1}`,
    title: `Conversation - Finance ${i + 1}`,
    projectId: 'finance',
    messages: [
      {
        id: Date.now() + 200 + i,
        role: 'user',
        content: `Message finance ${i + 1}`,
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date(Date.now() - (i * 1000 * 60 * 60 * 3)).toISOString()
  })),
  
  // Crytp (4 conversations)
  ...Array.from({length: 4}, (_, i) => ({
    id: `crypto-${i + 1}`,
    title: `Conversation - Crypto ${i + 1}`,
    projectId: 'crypto',
    messages: [
      {
        id: Date.now() + 300 + i,
        role: 'user',
        content: `Message crypto ${i + 1}`,
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date(Date.now() - (i * 1000 * 60 * 60 * 4)).toISOString()
  }))
];

localStorage.setItem('conversations', JSON.stringify(targetConversations));
localStorage.setItem('activeConversationId', 'ai-marketing-1'); // "Ai en blockchain" actif

// Configurer OpenAI par défaut
localStorage.setItem('selectedProvider', 'OPENAI');
localStorage.setItem('selectedModel', 'gpt-4o-mini');

console.log('✅ Réinitialisation terminée ! Rechargez la page (F5)');
console.log('🎯 L\'application devrait maintenant correspondre exactement à l\'image cible');
