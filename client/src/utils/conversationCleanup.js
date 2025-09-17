// src/utils/conversationCleanup.js - Utilitaire de nettoyage pour résoudre les fuites
class ConversationCleanupUtility {
  constructor() {
    this.apiUrl = 'http://localhost:3001/api';
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('brain_invest_token')}`,
      'Content-Type': 'application/json'
    };
  }

  getCurrentUserId() {
    try {
      const userData = localStorage.getItem('brain_invest_user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id?.toString();
      }
      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }

  // DIAGNOSTIC COMPLET DES CONVERSATIONS
  async diagnosticConversations() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        return { error: 'Aucun utilisateur connecté' };
      }

      const response = await fetch(`${this.apiUrl}/conversations`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const conversations = await response.json();
      
      const analysis = {
        userId: userId,
        totalConversations: conversations.length,
        emptyConversations: 0,
        validConversations: 0,
        conversationsWithUserMessages: 0,
        conversationsWithoutUser: 0,
        breakdown: []
      };

      conversations.forEach(conv => {
        const userMessages = conv.messages?.filter(msg => msg.role === 'user') || [];
        const convAnalysis = {
          id: conv._id,
          title: conv.title,
          userId: conv.userId,
          belongsToCurrentUser: conv.userId === userId,
          totalMessages: conv.messages?.length || 0,
          userMessages: userMessages.length,
          isEmpty: userMessages.length === 0,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt
        };

        analysis.breakdown.push(convAnalysis);

        if (userMessages.length === 0) {
          analysis.emptyConversations++;
        } else {
          analysis.validConversations++;
        }

        if (userMessages.length > 0) {
          analysis.conversationsWithUserMessages++;
        }

        if (!conv.userId || conv.userId !== userId) {
          analysis.conversationsWithoutUser++;
        }
      });

      console.log('📊 Diagnostic des conversations:', analysis);
      return analysis;
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
      return { error: error.message };
    }
  }

  // NETTOYAGE DES CONVERSATIONS VIDES DE L'UTILISATEUR ACTUEL
  async cleanupEmptyConversations() {
    try {
      const diagnostic = await this.diagnosticConversations();
      if (diagnostic.error) {
        return diagnostic;
      }

      const emptyConversations = diagnostic.breakdown.filter(conv => 
        conv.isEmpty && conv.belongsToCurrentUser
      );

      console.log(`🧹 Nettoyage de ${emptyConversations.length} conversations vides`);

      const deletionResults = [];
      for (const conv of emptyConversations) {
        try {
          const response = await fetch(`${this.apiUrl}/conversations/${conv.id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });

          if (response.ok) {
            deletionResults.push({ id: conv.id, status: 'deleted' });
            console.log(`✅ Conversation supprimée: ${conv.id}`);
          } else {
            deletionResults.push({ id: conv.id, status: 'failed', error: response.status });
            console.log(`❌ Échec suppression: ${conv.id} (${response.status})`);
          }
        } catch (error) {
          deletionResults.push({ id: conv.id, status: 'error', error: error.message });
          console.log(`❌ Erreur suppression: ${conv.id} (${error.message})`);
        }
      }

      return {
        cleaned: deletionResults.filter(r => r.status === 'deleted').length,
        failed: deletionResults.filter(r => r.status !== 'deleted').length,
        details: deletionResults
      };
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      return { error: error.message };
    }
  }

  // NETTOYAGE COMPLET (RESET) - À utiliser avec précaution
  async fullReset() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        return { error: 'Aucun utilisateur connecté' };
      }

      console.log(`🚨 RESET COMPLET pour l'utilisateur: ${userId}`);

      // Récupérer toutes les conversations de l'utilisateur
      const response = await fetch(`${this.apiUrl}/conversations`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const conversations = await response.json();
      
      // Supprimer TOUTES les conversations de l'utilisateur
      const deletionResults = [];
      for (const conv of conversations) {
        try {
          const deleteResponse = await fetch(`${this.apiUrl}/conversations/${conv._id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });

          if (deleteResponse.ok) {
            deletionResults.push({ id: conv._id, status: 'deleted' });
            console.log(`✅ Conversation supprimée: ${conv._id}`);
          } else {
            deletionResults.push({ id: conv._id, status: 'failed', error: deleteResponse.status });
          }
        } catch (error) {
          deletionResults.push({ id: conv._id, status: 'error', error: error.message });
        }
      }

      return {
        totalDeleted: deletionResults.filter(r => r.status === 'deleted').length,
        totalFailed: deletionResults.filter(r => r.status !== 'deleted').length,
        details: deletionResults,
        message: 'Reset complet terminé'
      };
    } catch (error) {
      console.error('Erreur lors du reset complet:', error);
      return { error: error.message };
    }
  }

  // VÉRIFICATION DE L'ISOLATION UTILISATEUR
  async verifyUserIsolation() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        return { error: 'Aucun utilisateur connecté' };
      }

      const response = await fetch(`${this.apiUrl}/conversations`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const conversations = await response.json();
      
      const isolation = {
        userId: userId,
        totalConversations: conversations.length,
        belongToCurrentUser: 0,
        belongToOtherUsers: 0,
        withoutUserId: 0,
        isolationStatus: 'unknown'
      };

      conversations.forEach(conv => {
        if (!conv.userId) {
          isolation.withoutUserId++;
        } else if (conv.userId === userId) {
          isolation.belongToCurrentUser++;
        } else {
          isolation.belongToOtherUsers++;
        }
      });

      // Déterminer le statut d'isolation
      if (isolation.belongToOtherUsers === 0 && isolation.withoutUserId === 0) {
        isolation.isolationStatus = 'PARFAIT';
      } else if (isolation.belongToOtherUsers > 0) {
        isolation.isolationStatus = 'FUITE_DETECTEE';
      } else if (isolation.withoutUserId > 0) {
        isolation.isolationStatus = 'CONVERSATIONS_ORPHELINES';
      }

      console.log('🔒 Vérification isolation:', isolation);
      return isolation;
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return { error: error.message };
    }
  }

  // INTERFACE UTILISATEUR SIMPLE
  async runInteractiveCleanup() {
    console.log('🛠️ === UTILITAIRE DE NETTOYAGE DES CONVERSATIONS ===');
    
    // Étape 1: Diagnostic
    console.log('\n1️⃣ Diagnostic en cours...');
    const diagnostic = await this.diagnosticConversations();
    
    if (diagnostic.error) {
      console.error('❌ Erreur diagnostic:', diagnostic.error);
      return;
    }

    console.log(`📊 Résultats:
    - Total conversations: ${diagnostic.totalConversations}
    - Conversations valides: ${diagnostic.validConversations}
    - Conversations vides: ${diagnostic.emptyConversations}
    - Conversations sans userId: ${diagnostic.conversationsWithoutUser}`);

    // Étape 2: Vérification isolation
    console.log('\n2️⃣ Vérification isolation...');
    const isolation = await this.verifyUserIsolation();
    
    if (isolation.error) {
      console.error('❌ Erreur isolation:', isolation.error);
      return;
    }

    console.log(`🔒 Statut isolation: ${isolation.isolationStatus}
    - Appartiennent à vous: ${isolation.belongToCurrentUser}
    - Appartiennent à d'autres: ${isolation.belongToOtherUsers}
    - Sans userId: ${isolation.withoutUserId}`);

    // Étape 3: Nettoyage si nécessaire
    if (diagnostic.emptyConversations > 0) {
      console.log('\n3️⃣ Nettoyage des conversations vides...');
      const cleanup = await this.cleanupEmptyConversations();
      
      if (cleanup.error) {
        console.error('❌ Erreur nettoyage:', cleanup.error);
      } else {
        console.log(`✅ Nettoyage terminé:
        - Supprimées: ${cleanup.cleaned}
        - Échecs: ${cleanup.failed}`);
      }
    }

    console.log('\n✅ Nettoyage interactif terminé!');
    return { diagnostic, isolation };
  }
}

// Instance globale
const conversationCleanup = new ConversationCleanupUtility();

// Interface pour utilisation dans la console
window.conversationCleanup = conversationCleanup;

// Fonctions pratiques
window.diagnosticConversations = () => conversationCleanup.diagnosticConversations();
window.cleanupConversations = () => conversationCleanup.cleanupEmptyConversations();
window.verifyIsolation = () => conversationCleanup.verifyUserIsolation();
window.fullReset = () => conversationCleanup.fullReset();
window.runCleanup = () => conversationCleanup.runInteractiveCleanup();

export default conversationCleanup;