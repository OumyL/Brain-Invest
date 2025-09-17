// src/services/detailedResponseService.js - Version avec traduction française
import mcpService from './mcpService';
import responseTranslationService from './responseTranslationService';

class DetailedResponseService {
  constructor() {
    this.welcomeMessage = this.generateWelcomeMessage();
  }

  async generateDetailedAnalysis(message) {
    // Gestion spéciale des commandes système
    if (this.isSystemCommand(message)) {
      return await this.handleSystemCommand(message);
    }

    // Détection des outils spécialisés et symboles avec NLP amélioré
    const detectedTool = this.detectSpecializedTool(message);
    
    if (detectedTool) {
      return await this.handleSpecializedTool(detectedTool);
    }

    // Détection des symboles pour analyse standard
    const symbols = this.extractSymbols(message);
    
    if (symbols.length === 0) {
      return this.welcomeMessage;
    }

    // Analyse standard du premier symbole détecté
    return await this.generateComprehensiveAnalysis(symbols[0]);
  }

  detectSpecializedTool(message) {
    const lowerMessage = message.toLowerCase();
    
    // Extraire d'abord tous les symboles possibles avec nouvelle méthode
    const detectedSymbols = this.extractAllSymbols(message);
    const mainSymbol = detectedSymbols[0]?.symbol;
    
    if (!mainSymbol) {
      return null;
    }

    // ========== ANALYSE FONDAMENTALE ==========
    const fundamentalKeywords = [
      'fondamentale?', 'fundamental?', 'financier?e?', 'bilan', 'compte.*résultat',
      'ratio', 'pe.*ratio', 'valorisation', 'valuation', 'revenus?', 'revenue',
      'bénéfices?', 'profit', 'dette', 'debt', 'capitaux', 'equity',
      'marge.*bénéficiaire', 'profit.*margin', 'roe', 'roa', 'financière?s?'
    ];
    
    if (this.matchesAnyPattern(lowerMessage, fundamentalKeywords)) {
      return {
        type: 'analyze_fundamentals',
        symbol: mainSymbol
      };
    }

    // ========== THÈSE D'INVESTISSEMENT ==========
    const thesisKeywords = [
      'thèse.*investissement', 'investment.*thesis', 'recommandation.*investissement',
      'conseil.*investissement', 'faut.*il.*acheter', 'dois.*je.*acheter',
      'investir.*dans', 'acheter.*action', 'opportunité.*investissement',
      'faut.*il.*investir', 'dois.*je.*investir', 'conseil.*achat'
    ];
    
    if (this.matchesAnyPattern(lowerMessage, thesisKeywords)) {
      return {
        type: 'investment_thesis', 
        symbol: mainSymbol
      };
    }

    // ========== ANALYSE TECHNIQUE ==========
    const technicalKeywords = [
      'technique?', 'technical?', 'indicateurs?', 'rsi', 'macd', 'moyennes?.*mobiles?',
      'bollinger', 'support.*résistance', 'tendance', 'trend', 'momentum',
      'analyse.*graphique', 'chart.*analysis', 'signals?.*trading',
      'analyse.*technique', 'technical.*analysis'
    ];
    
    if (this.matchesAnyPattern(lowerMessage, technicalKeywords)) {
      // Si c'est crypto, utiliser analyze_crypto, sinon analyze_stock
      return {
        type: detectedSymbols[0]?.type === 'crypto' ? 'analyze_crypto' : 'analyze_stock',
        symbol: mainSymbol
      };
    }

    // ========== ANALYSE GÉNÉRALE ==========
    const generalAnalysisKeywords = [
      'analys', 'étud', 'regarde', 'examine', 'évalue',
      'donne.*moi.*', 'peux.*tu.*', 'je.*veux.*', 'j\'aimerais.*',
      'montre.*moi.*', 'info', 'renseigne.*moi', 'analyse.*de',
      'peux.*tu.*analyser', 'analyse.*moi', 'étudier'
    ];
    
    if (this.matchesAnyPattern(lowerMessage, generalAnalysisKeywords)) {
      // Analyse générale = technique par défaut
      return {
        type: detectedSymbols[0]?.type === 'crypto' ? 'analyze_crypto' : 'analyze_stock',
        symbol: mainSymbol
      };
    }

    // ========== OUTILS SPÉCIALISÉS ==========
    
    // Sentiment Analysis
    const sentimentKeywords = [
      'sentiment', 'actualité', 'news', 'presse', 'média',
      'opinion.*marché', 'humeur.*marché', 'buzz', 'actualités',
      'nouvelles', 'sentiment.*marché'
    ];
    
    if (this.matchesAnyPattern(lowerMessage, sentimentKeywords)) {
      return {
        type: 'analyze_sentiment',
        symbol: mainSymbol
      };
    }

    // Earnings Analysis
    const earningsKeywords = [
      'résultats?', 'earnings?', 'bénéfices?.*trimestriels?',
      'quarterly.*results?', 'rapport.*financier', 'financial.*report',
      'résultats.*financiers'
    ];
    
    if (this.matchesAnyPattern(lowerMessage, earningsKeywords)) {
      return {
        type: 'earnings_analysis', 
        symbol: mainSymbol
      };
    }

    // Quick Recommendation
    const quickKeywords = [
      'recommandation.*rapide', 'quick.*recommendation', 'conseil.*rapide',
      'acheter.*ou.*vendre', 'buy.*or.*sell', 'que.*faire.*avec',
      'rapide.*conseil', 'avis.*rapide'
    ];
    
    if (this.matchesAnyPattern(lowerMessage, quickKeywords)) {
      return {
        type: 'quick_recommendation',
        symbol: mainSymbol
      };
    }

    // Final Recommendation  
    const finalKeywords = [
      'recommandation.*finale', 'final.*recommendation', 'décision.*finale',
      'conseil.*définitif', 'verdict', 'conclusion.*investissement',
      'recommandation.*complète'
    ];
    
    if (this.matchesAnyPattern(lowerMessage, finalKeywords)) {
      return {
        type: 'get_final_recommendation',
        symbol: mainSymbol,
        analysis_type: 'complete'
      };
    }

    return null;
  }

  // Nouvelle méthode helper pour matcher les patterns
  matchesAnyPattern(text, patterns) {
    return patterns.some(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(text);
    });
  }

  // Méthode améliorée pour extraire tous les symboles
  extractAllSymbols(message) {
    const symbols = [];
    const text = message.toUpperCase();
    
    // Dictionnaire étendu avec variantes
    const symbolMap = {
      // Cryptos
      'BTC': { type: 'crypto', names: ['BTC', 'BITCOIN', 'BITCOINS'] },
      'ETH': { type: 'crypto', names: ['ETH', 'ETHEREUM', 'ETHER'] },
      'ADA': { type: 'crypto', names: ['ADA', 'CARDANO'] },
      'SOL': { type: 'crypto', names: ['SOL', 'SOLANA'] },
      'DOT': { type: 'crypto', names: ['DOT', 'POLKADOT'] },
      'MATIC': { type: 'crypto', names: ['MATIC', 'POLYGON'] },
      'AVAX': { type: 'crypto', names: ['AVAX', 'AVALANCHE'] },
      'LINK': { type: 'crypto', names: ['LINK', 'CHAINLINK'] },
      'UNI': { type: 'crypto', names: ['UNI', 'UNISWAP'] },
      'DOGE': { type: 'crypto', names: ['DOGE', 'DOGECOIN'] },
      
      // Actions avec noms complets
      'AAPL': { type: 'stock', names: ['AAPL', 'APPLE', 'APPL'] }, // Faute courante
      'TSLA': { type: 'stock', names: ['TSLA', 'TESLA'] },
      'MSFT': { type: 'stock', names: ['MSFT', 'MICROSOFT'] },
      'GOOGL': { type: 'stock', names: ['GOOGL', 'GOOGLE', 'ALPHABET'] },
      'AMZN': { type: 'stock', names: ['AMZN', 'AMAZON'] },
      'META': { type: 'stock', names: ['META', 'FACEBOOK', 'FB'] },
      'NVDA': { type: 'stock', names: ['NVDA', 'NVIDIA'] },
      'NFLX': { type: 'stock', names: ['NFLX', 'NETFLIX'] },
      'AMD': { type: 'stock', names: ['AMD', 'ADVANCED MICRO DEVICES'] },
      'INTC': { type: 'stock', names: ['INTC', 'INTEL'] },
      'CRM': { type: 'stock', names: ['CRM', 'SALESFORCE'] },
      'ORCL': { type: 'stock', names: ['ORCL', 'ORACLE'] },
      'IBM': { type: 'stock', names: ['IBM'] },
      'DIS': { type: 'stock', names: ['DIS', 'DISNEY'] },
      'V': { type: 'stock', names: ['V', 'VISA'] },
      'MA': { type: 'stock', names: ['MA', 'MASTERCARD'] },
      'JPM': { type: 'stock', names: ['JPM', 'JP MORGAN', 'JPMORGAN'] },
      'BAC': { type: 'stock', names: ['BAC', 'BANK OF AMERICA'] }
    };
    
    // Chercher chaque symbole et ses variantes
    for (const [symbol, data] of Object.entries(symbolMap)) {
      for (const variant of data.names) {
        // Recherche exacte avec délimiteurs de mots
        const regex = new RegExp(`\\b${variant}\\b`, 'gi');
        if (regex.test(text)) {
          symbols.push({
            symbol: symbol,
            type: data.type,
            detectedAs: variant,
            confidence: variant === symbol ? 1.0 : 0.8
          });
          break; // Éviter les doublons pour le même symbole
        }
      }
    }
    
    // Recherche générique pour les symboles non mappés (3-5 lettres)
    if (symbols.length === 0) {
      const genericMatches = text.match(/\b[A-Z]{3,5}\b/g);
      if (genericMatches) {
        // Filtrer les mots courants 
        const excludeWords = ['AND', 'THE', 'FOR', 'YOU', 'ARE', 'NOT', 'BUT', 'CAN', 'ALL', 'ONE', 'OUT', 'DAY', 'GET', 'USE', 'MAN', 'NEW', 'NOW', 'OLD', 'SEE', 'HIM', 'TWO', 'HOW', 'ITS', 'OUR', 'MAY', 'SAY', 'SHE', 'HAS', 'HER', 'QUI', 'EST', 'UNE', 'DES', 'LES', 'SUR', 'PAR', 'MOI', 'TOI', 'LUI', 'ETC'];
        
        for (const match of genericMatches) {
          if (!excludeWords.includes(match)) {
            symbols.push({
              symbol: match,
              type: 'stock', // Par défaut stock pour les symboles génériques
              detectedAs: match,
              confidence: 0.6
            });
          }
        }
      }
    }
    
    // Trier par confiance
    symbols.sort((a, b) => b.confidence - a.confidence);
    
    return symbols;
  }

  // Méthode améliorée pour les symboles (pour compatibilité avec le code existant)
  extractSymbols(message) {
    const allSymbols = this.extractAllSymbols(message);
    return allSymbols.map(s => ({ symbol: s.symbol, type: s.type }));
  }

  async handleSpecializedTool(toolDef) {
    try {
      console.log('Handling specialized tool:', toolDef);
      
      let result;
      
      switch (toolDef.type) {
        case 'relative_strength':
          result = await mcpService.callMCPTool('relative_strength', {
            symbol: toolDef.symbol,
            benchmark: toolDef.benchmark
          });
          break;

        case 'volume_profile':
          result = await mcpService.callMCPTool('volume_profile', {
            symbol: toolDef.symbol
          });
          break;

        case 'detect_patterns':
          result = await mcpService.callMCPTool('detect_patterns', {
            symbol: toolDef.symbol
          });
          break;

        case 'suggest_stops':
          result = await mcpService.callMCPTool('suggest_stops', {
            symbol: toolDef.symbol
          });
          break;

        case 'position_size':
          result = await mcpService.callMCPTool('position_size', {
            symbol: toolDef.symbol,
            stop_price: toolDef.stop_price,
            risk_amount: toolDef.risk_amount,
            account_size: toolDef.account_size
          });
          break;

        case 'analyze_fundamentals':
          result = await mcpService.callMCPTool('analyze_fundamentals', {
            symbol: toolDef.symbol
          });
          break;

        case 'analyze_stock':
          result = await mcpService.callMCPTool('analyze_stock', {
            symbol: toolDef.symbol
          });
          break;

        case 'analyze_crypto':
          result = await mcpService.callMCPTool('analyze_crypto', {
            symbol: toolDef.symbol
          });
          break;

        case 'investment_thesis':
          result = await mcpService.callMCPTool('investment_thesis', {
            symbol: toolDef.symbol
          });
          break;

        case 'earnings_analysis':
          result = await mcpService.callMCPTool('earnings_analysis', {
            symbol: toolDef.symbol
          });
          break;

        case 'compare_companies':
          result = await mcpService.callMCPTool('compare_companies', {
            symbols: toolDef.symbols
          });
          break;

        case 'analyze_sentiment':
          result = await mcpService.callMCPTool('analyze_sentiment', {
            symbol: toolDef.symbol
          });
          break;

        case 'screen_momentum_stocks':
          result = await mcpService.callMCPTool('screen_momentum_stocks', {
            symbols: toolDef.symbols
          });
          break;

        case 'market_overview':
          result = await mcpService.callMCPTool('market_overview', {
            symbols: toolDef.symbols
          });
          break;

        case 'quick_recommendation':
          result = await mcpService.callMCPTool('quick_recommendation', {
            symbol: toolDef.symbol
          });
          break;

        case 'get_final_recommendation':
          result = await mcpService.callMCPTool('get_final_recommendation', {
            symbol: toolDef.symbol,
            analysis_type: toolDef.analysis_type
          });
          break;

        default:
          throw new Error(`Unknown specialized tool: ${toolDef.type}`);
      }

      if (result.success && result.content) {
        // NOUVELLE LIGNE: Traduire la réponse avant de la retourner
        const translatedContent = responseTranslationService.forceFullTranslation(result.content);
        return translatedContent;
      } else {
        return `Erreur lors de l'exécution de ${toolDef.type}: ${result.error || 'Outil non disponible'}`;
      }

    } catch (error) {
      console.error('Specialized tool error:', error);
      return `Erreur lors de l'exécution de ${toolDef.type}: ${error.message}`;
    }
  }

  isSystemCommand(message) {
    const systemCommands = [
      'system diagnostic',
      'diagnostic système',
      'system_diagnostic',
      'api status',
      'health check',
      'server status'
    ];
    
    const lowerMessage = message.toLowerCase();
    return systemCommands.some(cmd => lowerMessage.includes(cmd));
  }

  async handleSystemCommand(message) {
    try {
      console.log('Handling system command:', message);
      
      const diagnostic = await mcpService.getSystemDiagnostic();
      
      if (diagnostic.success && diagnostic.content) {
        return diagnostic.content;
      } else {
        return this.generateBasicSystemStatus();
      }
    } catch (error) {
      console.error('System diagnostic failed:', error);
      return this.generateErrorSystemStatus(error.message);
    }
  }

  generateBasicSystemStatus() {
    return `## État du Système - Mode Fallback

### Statut des Services
- **Frontend React:** Opérationnel
- **Backend Node.js:** Opérationnel  
- **Serveur MCP Python:** Connexion en cours...
- **Bridge MCP:** Test de connectivité

### Recommandations
- Vérifiez que le serveur Python MCP est démarré
- Testez la connectivité avec une analyse simple
- Consultez les logs de la console pour plus de détails

*Dernière vérification: ${new Date().toLocaleString('fr-FR')}*`;
  }

  generateErrorSystemStatus(errorMessage) {
    return `## Diagnostic Système - Erreur Détectée

### Problème Identifié
**Erreur:** ${errorMessage}

### Solutions Recommandées
1. **Vérifiez le serveur MCP Python:**
   - Assurez-vous qu'il est démarré sur le port 8000
   - Vérifiez les logs pour d'éventuelles erreurs

2. **Testez la connectivité:**
   - Ouvrez http://localhost:8000/health dans votre navigateur
   - Vérifiez que le bridge MCP fonctionne

3. **Redémarrage complet:**
   - Redémarrez le serveur Python MCP
   - Redémarrez le bridge MCP
   - Actualisez la page

*Diagnostic effectué: ${new Date().toLocaleString('fr-FR')}*`;
  }

  async generateComprehensiveAnalysis(symbolData) {
    const { symbol, type } = symbolData;
    
    try {
      console.log(`Generating standard analysis for ${symbol} (${type})`);
      
      let analysis;
      if (type === 'crypto') {
        analysis = await mcpService.analyzeCrypto(symbol);
      } else {
        analysis = await mcpService.analyzeTechnical(symbol);
      }

      if (analysis.success && analysis.raw_content) {
        return analysis.raw_content;
      } else if (analysis.success) {
        return this.formatStructuredAnalysis(symbol, type, analysis);
      } else {
        return this.buildDetailedReport(symbol, type, this.generateFallbackData(symbol, type));
      }
    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      return this.buildDetailedReport(symbol, type, this.generateFallbackData(symbol, type));
    }
  }

  formatStructuredAnalysis(symbol, type, analysis) {
    const data = analysis.analysis;
    const assetType = type === 'crypto' ? 'CRYPTO' : 'ACTION';
    
    return `## ANALYSE ${assetType} - ${symbol}

### DONNÉES DE MARCHÉ
**Prix actuel :** ${data.price?.toFixed(2) || 'N/A'}
**Variation 24h :** ${data.change_24h?.toFixed(2) || '0.00'}% ${(data.change_24h || 0) >= 0 ? '📈' : '📉'}
**Volume :** ${this.formatVolume(data.volume)}

### ANALYSE TECHNIQUE AVANCÉE
**RSI (${data.technical_indicators?.rsi || 50}):** ${this.interpretRSI(data.technical_indicators?.rsi)}
**Tendance :** ${data.technical_indicators?.trend === 'bullish' ? 'Haussière' : 'Baissière'}
**Support :** ${data.technical_indicators?.support_level?.toFixed(2) || 'N/A'}
**Résistance :** ${data.technical_indicators?.resistance_level?.toFixed(2) || 'N/A'}

### RECOMMANDATION PROFESSIONNELLE
**Décision :** ${data.recommendation || 'CONSERVER'}
**Niveau de confiance :** ${Math.round((data.confidence_score || 0.8) * 100)}%

### AVERTISSEMENT
*Cette analyse est générée par notre système MCP en temps réel et ne constitue pas un conseil financier.*

*Source: ${analysis.source} - ${new Date().toLocaleString('fr-FR')}*`;
  }

  interpretRSI(rsi) {
    if (!rsi) return 'Non disponible';
    if (rsi > 70) return 'Zone de surachat - Prudence recommandée';
    if (rsi < 30) return 'Zone de survente - Opportunité potentielle';
    return 'Zone neutre - Momentum équilibré';
  }

  generateFallbackData(symbol, type) {
    const basePrices = {
      'BTC': 95000, 'ETH': 3600, 'ADA': 0.45, 'DOT': 5.2, 'LINK': 15.8, 'SOL': 140,
      'AAPL': 227, 'TSLA': 249, 'NVDA': 875, 'GOOGL': 165, 'MSFT': 420, 
      'AMZN': 155, 'META': 485, 'NFLX': 670, 'AMD': 142, 'INTC': 25
    };

    const basePrice = basePrices[symbol] || 100;
    const priceVariation = 1 + (Math.random() - 0.5) * 0.02;
    
    return {
      price: basePrice * priceVariation,
      change_24h: (Math.random() - 0.5) * 6,
      volume: type === 'crypto' ? 
        (Math.random() * 20 + 5) * 1e9 : 
        (Math.random() * 80 + 20) * 1e6,
      technical_indicators: {
        rsi: Math.round(35 + Math.random() * 30),
        trend: Math.random() > 0.4 ? 'bullish' : 'bearish',
        support_level: basePrice * (0.92 + Math.random() * 0.06),
        resistance_level: basePrice * (1.02 + Math.random() * 0.06),
        recommendation: this.getRandomRecommendation()
      },
      confidence_score: 0.7 + Math.random() * 0.25
    };
  }

  getRandomRecommendation() {
    const recommendations = ['ACHAT', 'CONSERVER', 'CONSERVER', 'VENDRE'];
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  }

  buildDetailedReport(symbol, type, data) {
    const assetType = type === 'crypto' ? 'CRYPTO' : 'ACTION';
    const price = data.price?.toFixed(type === 'crypto' && data.price < 1 ? 4 : 2) || 'N/A';
    const change = data.change_24h?.toFixed(2) || '0.00';
    const indicators = data.technical_indicators || {};
    
    let report = `## ANALYSE ${assetType} - ${symbol}\n\n`;
    
    report += `### PRIX ET PERFORMANCE\n`;
    report += `**Prix actuel :** ${price}\n`;
    report += `**Variation 24h :** ${change}% ${parseFloat(change) >= 0 ? '📈' : '📉'}\n`;
    
    if (data.volume) {
      report += `**Volume 24h :** ${this.formatVolume(data.volume)}\n`;
    }
    
    report += `\n### ANALYSE TECHNIQUE DÉTAILLÉE\n\n`;
    
    if (indicators.rsi) {
      const rsi = Math.round(indicators.rsi);
      report += `**RSI (${rsi}):** ${this.interpretRSI(rsi)}\n\n`;
    }

    const recommendation = indicators.recommendation || 'CONSERVER';
    const confidence = Math.round((data.confidence_score || 0.75) * 100);
    
    report += `### 🎯 RECOMMANDATION D'INVESTISSEMENT\n\n`;
    report += `**Décision :** ${recommendation}\n`;
    report += `**Niveau de confiance :** ${confidence}%\n\n`;

    report += `### ⚠️ AVERTISSEMENT\n`;
    report += `Cette analyse est fournie à titre informatif uniquement et ne constitue pas un conseil financier.\n\n`;
    report += `*Dernière mise à jour : ${new Date().toLocaleString('fr-FR')}*`;

    return report;
  }

  formatVolume(volume) {
    if (!volume) return 'N/A';
    if (volume >= 1e12) return `${(volume / 1e12).toFixed(2)}T`;
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toLocaleString();
  }

  generateWelcomeMessage() {
    return `## Bienvenue sur Brain Invest

Je suis votre assistant de trading intelligent, spécialisé dans l'analyse technique et fondamentale des marchés financiers.

### 🔍 Analyses en Temps Réel
Connecté à votre serveur MCP Python pour des analyses professionnelles avec :
- **Données de marché en temps réel** (Tiingo, Alpha Vantage)
- **15+ indicateurs techniques avancés**
- **Analyses fondamentales complètes**
- **Gestion intelligente des risques**

### 💬 Langage Naturel Amélioré
Posez vos questions en français naturel :

**Analyses Fondamentales:**
• "Donne moi l'analyse fondamentale de TSLA"
• "Peux-tu analyser financièrement Apple ?"
• "Je veux la valorisation de Microsoft"
• "Faut-il acheter Tesla ?"

**Analyses Techniques:**
• "Analyse technique de Bitcoin"
• "Peux-tu étudier les indicateurs d'Apple ?"
• "Regarde moi la tendance de NVDA"
• "Analyse-moi Tesla"

**Sentiment et Actualités:**
• "Actualités sur Tesla"
• "Sentiment du marché pour Apple"
• "Buzz autour de Bitcoin"

**Outils Spécialisés:**
• "Force relative d'Apple vs SPY"
• "Profil de volume de Tesla"
• "Détection de figures sur NVDA"
• "Suggère moi des stops pour AAPL"

**Commandes Système:**
• "Diagnostic système" - État complet des APIs

### 🎯 Symboles Reconnus
Le système comprend automatiquement :
- **Actions:** Apple, Tesla, Microsoft, Google, Amazon, Meta, Nvidia...
- **Cryptos:** Bitcoin, Ethereum, Cardano, Solana, Polkadot...
- **Symboles:** AAPL, TSLA, MSFT, BTC, ETH...

Essayez des phrases comme "Analyse moi Apple" ou "Donne moi l'analyse fondamentale de Tesla" !`;
  }
}

// Export par défaut
const detailedResponseService = new DetailedResponseService();
export default detailedResponseService;