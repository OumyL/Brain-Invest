// src/services/llmService.js - Version améliorée avec traduction française
import mcpService from './mcpService';
import responseTranslationService from './responseTranslationService';

class LLMService {
  constructor() {
    // Configuration des modèles disponibles
    this.models = {
      'local': {
        id: 'local',
        name: 'Brain Invest Local',
        provider: 'Local',
        available: true,
        description: 'Assistant intégré avec MCP'
      },
      'openai': {
        id: 'openai',
        name: 'ChatGPT',
        provider: 'OpenAI',
        available: false,
        apiKey: process.env.REACT_APP_OPENAI_API_KEY,
        description: 'GPT-4 via OpenAI API'
      },
      'anthropic': {
        id: 'anthropic',
        name: 'Claude',
        provider: 'Anthropic',
        available: false,
        apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
        description: 'Claude via Anthropic API'
      }
    };

    this.currentModel = 'local'; // Par défaut sur le modèle local
    this.initializeModels();
  }

  // Initialiser la disponibilité des modèles
  initializeModels() {
    Object.values(this.models).forEach(model => {
      if (model.id === 'local') return; // Local toujours disponible
      
      model.available = model.apiKey && 
        model.apiKey !== `your-${model.id}-api-key-here` &&
        model.apiKey !== `sk-your-${model.id}-key-here`;
    });
  }

  // Fonction principale améliorée avec traitement local
  async generateResponse(message, model = 'local', conversationHistory = []) {
    try {
      console.log(`Generating response with ${model} model...`);
      
      // Traitement local amélioré (par défaut)
      if (model === 'local' || !this.isModelAvailable(model)) {
        return await this.generateLocalResponse(message, conversationHistory);
      }

      // Traitement via API externe si disponible
      return await this.generateExternalResponse(message, model, conversationHistory);
      
    } catch (error) {
      console.error('Error generating response:', error);
      // Fallback sur le traitement local
      return await this.generateLocalResponse(message, conversationHistory);
    }
  }

  // Génération de réponse locale avec intégration MCP
  async generateLocalResponse(message, conversationHistory = []) {
    try {
      // 1. Détection de symboles financiers
      const detectedSymbols = this.extractFinancialSymbols(message);
      
      // 2. Analyse du contexte de conversation
      const context = this.analyzeConversationContext(message, conversationHistory);
      
      // 3. Si des symboles sont détectés, obtenir l'analyse MCP
      let mcpAnalysis = null;
      if (detectedSymbols.length > 0) {
        mcpAnalysis = await this.getMCPAnalysisForSymbols(detectedSymbols);
      }
      
      // 4. Générer une réponse intelligente
      const response = await this.craftIntelligentResponse({
        message,
        context,
        symbols: detectedSymbols,
        mcpAnalysis,
        conversationHistory
      });
      
      // NOUVELLE LIGNE: Traduire la réponse finale
      const translatedResponse = responseTranslationService.forceFullTranslation(response);
      
      return {
        success: true,
        content: translatedResponse, // Réponse traduite
        model: 'local',
        hasFinancialData: mcpAnalysis !== null,
        detectedSymbols: detectedSymbols,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Local response generation failed:', error);
      return this.generateFallbackResponse(message);
    }
  }

  // Analyser le contexte de conversation
  analyzeConversationContext(message, history) {
    const text = message.toLowerCase();
    
    const contexts = {
      greeting: ['bonjour', 'salut', 'hello', 'hi'],
      analysis: ['analyse', 'analyser', 'étudier', 'regarder'],
      recommendation: ['conseil', 'recommande', 'suggestion', 'avis'],
      price: ['prix', 'coût', 'valeur', 'cotation'],
      trend: ['tendance', 'évolution', 'direction', 'mouvement'],
      buy: ['acheter', 'achat', 'investir', 'position longue'],
      sell: ['vendre', 'vente', 'sortir', 'position courte'],
      risk: ['risque', 'danger', 'prudence', 'volatilité'],
      portfolio: ['portefeuille', 'portfolio', 'allocation'],
      news: ['actualité', 'news', 'information', 'événement']
    };

    const detectedContext = [];
    Object.entries(contexts).forEach(([context, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        detectedContext.push(context);
      }
    });

    return {
      detected: detectedContext,
      isQuestion: text.includes('?'),
      hasUrgency: ['urgent', 'vite', 'rapidement'].some(word => text.includes(word)),
      isFollowUp: history.length > 0,
      sentiment: this.detectSentiment(text)
    };
  }

  // Détecter le sentiment
  detectSentiment(text) {
    const positive = ['bien', 'bon', 'excellent', 'parfait', 'super', 'génial'];
    const negative = ['mal', 'mauvais', 'terrible', 'horrible', 'problème', 'erreur'];
    
    const posScore = positive.reduce((score, word) => text.includes(word) ? score + 1 : score, 0);
    const negScore = negative.reduce((score, word) => text.includes(word) ? score + 1 : score, 0);
    
    if (posScore > negScore) return 'positive';
    if (negScore > posScore) return 'negative';
    return 'neutral';
  }

  // Créer une réponse intelligente basée sur le contexte
  async craftIntelligentResponse({ message, context, symbols, mcpAnalysis, conversationHistory }) {
    let response = '';

    // Salutations
    if (context.detected.includes('greeting') && conversationHistory.length === 0) {
      response += "Bonjour ! Je suis Brain Invest, votre assistant de trading intelligent. ";
      response += "Je peux analyser des cryptomonnaies, actions et vous fournir des insights basés sur l'analyse technique.\n\n";
    }

    // Analyse financière avec données MCP
    if (symbols.length > 0 && mcpAnalysis) {
      response += await this.generateFinancialAnalysis(symbols, mcpAnalysis, context);
    }
    
    // Réponse contextuelle sans données financières
    else if (context.detected.length > 0) {
      response += this.generateContextualResponse(message, context);
    }
    
    // Réponse par défaut
    else {
      response += this.generateDefaultResponse(message);
    }

    // Ajouter des suggestions si pertinent
    if (symbols.length === 0 && !context.detected.includes('greeting')) {
      response += "\n\n *Mentionnez un symbole (ex: BTC, AAPL, TSLA) pour une analyse détaillée.*";
    }

    return response.trim();
  }

  // Génération d'analyse financière enrichie
  async generateFinancialAnalysis(symbols, mcpAnalysis, context) {
    let analysis = '';

    for (const { symbol, type } of symbols) {
      const data = mcpAnalysis[symbol];
      
      if (data && data.success && data.data) {
        analysis += `\n## Analyse de ${symbol} ${type === 'crypto' ? '(Crypto)' : '(Action)'}\n\n`;
        
        const analysisData = data.data;
        
        // Prix et variation
        if (analysisData.price !== undefined) {
          const change = analysisData.change_24h || 0;
          const changeEmoji = change >= 0 ? '📈' : '📉';
          const changeColor = change >= 0 ? 'positive' : 'négative';
          
          analysis += `**Prix actuel :** $${analysisData.price.toFixed(2)}\n`;
          analysis += `**Variation 24h :** ${changeEmoji} ${change.toFixed(2)}% (${changeColor})\n`;
          
          if (analysisData.volume) {
            analysis += `**Volume :** ${this.formatVolume(analysisData.volume)}\n\n`;
          }
        }

        // Indicateurs techniques
        if (analysisData.technical_indicators) {
          analysis += this.generateTechnicalAnalysis(analysisData.technical_indicators);
        }

        // Recommandation
        if (analysisData.recommendation) {
          analysis += this.generateRecommendationText(symbol, analysisData.recommendation, context);
        }
      } else {
        analysis += `\n Données temporairement indisponibles pour ${symbol}. Le serveur MCP est en cours de connexion.\n`;
      }
    }

    return analysis;
  }

  // Génération d'analyse technique textuelle
  generateTechnicalAnalysis(indicators) {
    let tech = "\n### Signaux techniques :\n";
    
    if (indicators.rsi !== undefined) {
      const rsi = indicators.rsi;
      let rsiSignal;
      if (rsi > 70) rsiSignal = "surachat - prudence recommandée";
      else if (rsi < 30) rsiSignal = "survente - opportunité potentielle";
      else rsiSignal = "zone neutre";
      
      tech += `- **RSI (${rsi}) :** ${rsiSignal}\n`;
    }
    
    if (indicators.trend) {
      const trendEmoji = indicators.trend === 'bullish' ? '🟢' : '🔴';
      tech += `- **Tendance :** ${trendEmoji} ${indicators.trend === 'bullish' ? 'Haussière' : 'Baissière'}\n`;
    }
    
    if (indicators.support_level && indicators.resistance_level) {
      tech += `- **Support :** ${indicators.support_level.toFixed(2)}\n`;
      tech += `- **Résistance :** ${indicators.resistance_level.toFixed(2)}\n`;
    }
    
    return tech + "\n";
  }

  // Générer le texte de recommandation
  generateRecommendationText(symbol, recommendation, context) {
    let rec = "\n### Recommandation :\n";
    
    switch (recommendation.toUpperCase()) {
      case 'ACHAT FORT':
      case 'BUY':
        rec += `**${symbol}** présente des signaux d'achat favorables. Les indicateurs techniques sont positifs. `;
        if (context.detected.includes('risk')) {
          rec += "Cependant, respectez votre gestion des risques et ne risquez que ce que vous pouvez vous permettre de perdre.";
        }
        break;
        
      case 'VENDRE':
      case 'SELL':
        rec += `**${symbol}** montre des signaux de faiblesse. Les indicateurs suggèrent une prudence accrue. `;
        rec += "Considérez une prise de bénéfices ou un stop-loss selon votre stratégie.";
        break;
        
      default: // CONSERVER
        rec += `**${symbol}** se trouve dans une phase de consolidation. Les signaux sont mixtes. `;
        rec += "Attendez des signaux plus clairs avant de prendre position.";
    }
    
    rec += "\n\n*Cette analyse est fournie à titre informatif et ne constitue pas un conseil financier.*";
    return rec;
  }

  // Réponse contextuelle sans données financières
  generateContextualResponse(message, context) {
    if (context.detected.includes('analysis')) {
      return "Je suis spécialisé dans l'analyse financière en temps réel. Mentionnez un symbole pour commencer !";
    }
    
    if (context.detected.includes('recommendation')) {
      return "Je peux vous fournir des recommandations basées sur l'analyse technique. Quel actif vous intéresse ?";
    }
    
    if (context.detected.includes('portfolio')) {
      return "Pour analyser votre portefeuille, mentionnez les symboles de vos positions actuelles.";
    }
    
    return "Comment puis-je vous aider avec vos investissements aujourd'hui ?";
  }

  // Réponse par défaut
  generateDefaultResponse(message) {
    const responses = [
      "Je suis Brain Invest, votre assistant de trading intelligent. Mentionnez un symbole (BTC, ETH, AAPL, TSLA...) pour une analyse détaillée.",
      "Posez-moi vos questions sur l'analyse technique, les cryptomonnaies ou les marchés financiers !",
      "Que souhaitez-vous analyser aujourd'hui ? Je peux traiter les cryptos et les actions en temps réel."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Méthodes utilitaires conservées et améliorées
  extractFinancialSymbols(message) {
    const symbols = [];
    const text = message.toUpperCase();
    
    // Patterns étendus
    const cryptoPatterns = {
      'BTC': ['BTC', 'BITCOIN'],
      'ETH': ['ETH', 'ETHEREUM'],
      'ADA': ['ADA', 'CARDANO'],
      'SOL': ['SOL', 'SOLANA'],
      'DOT': ['DOT', 'POLKADOT'],
      'MATIC': ['MATIC', 'POLYGON'],
      'AVAX': ['AVAX', 'AVALANCHE'],
      'LINK': ['LINK', 'CHAINLINK'],
      'UNI': ['UNI', 'UNISWAP'],
      'DOGE': ['DOGE', 'DOGECOIN']
    };
    
    const stockPatterns = {
      'AAPL': ['AAPL', 'APPLE'],
      'MSFT': ['MSFT', 'MICROSOFT'],
      'GOOGL': ['GOOGL', 'GOOGLE', 'ALPHABET'],
      'AMZN': ['AMZN', 'AMAZON'],
      'TSLA': ['TSLA', 'TESLA'],
      'META': ['META', 'FACEBOOK'],
      'NVDA': ['NVDA', 'NVIDIA'],
      'NFLX': ['NFLX', 'NETFLIX'],
      'AMD': ['AMD'],
      'INTC': ['INTC', 'INTEL']
    };
    
    // Détecter cryptos
    Object.entries(cryptoPatterns).forEach(([symbol, patterns]) => {
      if (patterns.some(pattern => text.includes(pattern))) {
        symbols.push({ symbol, type: 'crypto' });
      }
    });
    
    // Détecter actions
    Object.entries(stockPatterns).forEach(([symbol, patterns]) => {
      if (patterns.some(pattern => text.includes(pattern))) {
        symbols.push({ symbol, type: 'stock' });
      }
    });
    
    return symbols;
  }

  async getMCPAnalysisForSymbols(symbols) {
    const analyses = {};
    
    const promises = symbols.map(async ({ symbol, type }) => {
      try {
        let analysis;
        if (type === 'crypto') {
          analysis = await mcpService.analyzeCrypto(symbol);
        } else {
          analysis = await mcpService.analyzeTechnical(symbol);
        }
        analyses[symbol] = analysis;
      } catch (error) {
        console.error(`Error analyzing ${symbol}:`, error);
        analyses[symbol] = { success: false, error: error.message };
      }
    });
    
    await Promise.allSettled(promises);
    return analyses;
  }

  formatVolume(volume) {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toString();
  }

  // Génération via API externe (si configurée)
  async generateExternalResponse(message, model, conversationHistory) {
    // TODO: Implémenter l'intégration avec OpenAI/Anthropic
    console.log(`External API integration for ${model} not yet implemented`);
    return await this.generateLocalResponse(message, conversationHistory);
  }

  // Réponse de fallback
  generateFallbackResponse(message) {
    return {
      success: false,
      content: "Désolé, une erreur s'est produite lors de l'analyse. Le service local est temporairement indisponible.",
      model: 'fallback',
      error: true,
      timestamp: new Date().toISOString()
    };
  }

  // Méthodes utilitaires
  getAvailableModels() {
    return Object.values(this.models).filter(model => model.available);
  }

  isModelAvailable(modelId) {
    return this.models[modelId]?.available || false;
  }

  setCurrentModel(modelId) {
    if (this.isModelAvailable(modelId)) {
      this.currentModel = modelId;
      console.log(`Switched to ${modelId} model`);
      return true;
    }
    console.warn(`Model ${modelId} is not available`);
    return false;
  }

  getCurrentModel() {
    return this.models[this.currentModel];
  }

  // Diagnostic du service
  getServiceStatus() {
    return {
      currentModel: this.currentModel,
      availableModels: this.getAvailableModels().map(m => ({
        id: m.id,
        name: m.name,
        provider: m.provider
      })),
      timestamp: new Date().toISOString()
    };
  }
}

// Instance singleton
const llmService = new LLMService();

// Export par défaut
export default llmService;

// Exports nommés pour compatibilité
export const generateResponse = (message, model, history) => 
  llmService.generateResponse(message, model, history);

export const getAvailableModels = () => 
  llmService.getAvailableModels();

export const setCurrentModel = (modelId) =>
  llmService.setCurrentModel(modelId);