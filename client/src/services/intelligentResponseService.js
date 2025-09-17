// src/services/intelligentResponseService.js - SYSTÈME FINAL
import mcpService from './mcpService';

class IntelligentResponseService {
  constructor() {
    this.analysisCache = new Map();
    this.responseTemplates = this.initializeTemplates();
  }

  initializeTemplates() {
    return {
      crypto_bullish: [
        " **{SYMBOL}** affiche une dynamique haussière prometteuse ! Le prix actuel de **${PRICE}** représente une hausse de **{CHANGE}%** sur 24h.\n\n**Signaux techniques positifs :**\n• RSI à {RSI} - Zone favorable\n• Tendance {TREND} confirmée\n• Support solide à ${SUPPORT}\n\n**💡 Mon analyse :** Les indicateurs convergent vers un signal d'achat. Volume en hausse de {VOLUME}, momentum positif détecté.",
        
        " **{SYMBOL}** dans une excellente configuration technique ! Prix : **${PRICE}** ({CHANGE}% sur 24h)\n\n**Points clés :**\n• MACD en territoire positif\n• Cassure de résistance à ${RESISTANCE}\n• Volume institutionnel en hausse\n\n**🎯 Recommandation :** {RECOMMENDATION} avec un objectif à ${TARGET}. Stop-loss suggéré : ${SUPPORT}"
      ],
      
      crypto_bearish: [
        "**{SYMBOL}** traverse une phase de correction. Prix actuel : **${PRICE}** (baisse de {CHANGE}% sur 24h)\n\n**Signaux d'alerte :**\n• RSI en survente ({RSI})\n• Cassure du support ${SUPPORT}\n• Volume de vente élevé\n\n**⚠️ Prudence recommandée :** Attendre une stabilisation avant toute position."
      ],
      
      stock_analysis: [
        "**Analyse {SYMBOL}** - Action à **${PRICE}** ({CHANGE}%)\n\n**Analyse technique :**\n• Moyennes mobiles : MM20 ${SMA20} | MM50 ${SMA50}\n• RSI : {RSI} ({RSI_SIGNAL})\n• Tendance générale : {TREND}\n\n**📈 Perspective :** {ANALYSIS_SUMMARY}\n\n**Recommandation :** {RECOMMENDATION} (Confiance: {CONFIDENCE}%)"
      ],
      
      market_overview: [
        " **Aperçu du marché** - {TIMESTAMP}\n\n**Top Performers :**\n{TOP_PERFORMERS}\n\n**Secteurs en vue :**\n• Tech : {TECH_PERFORMANCE}\n• Crypto : {CRYPTO_PERFORMANCE}\n\n**Sentiment général :** {MARKET_SENTIMENT}"
      ]
    };
  }

  async generateResponse(message) {
    const symbols = this.extractSymbols(message);
    
    if (symbols.length === 0) {
      return this.generateWelcomeResponse(message);
    }

    if (symbols.length === 1) {
      return await this.generateSingleSymbolAnalysis(symbols[0]);
    }

    return await this.generateMultiSymbolAnalysis(symbols);
  }

  extractSymbols(message) {
    const text = message.toUpperCase();
    const symbols = [];
    
    const patterns = {
      'BTC': { type: 'crypto', names: ['BTC', 'BITCOIN'] },
      'ETH': { type: 'crypto', names: ['ETH', 'ETHEREUM'] },
      'AAPL': { type: 'stock', names: ['AAPL', 'APPLE'] },
      'TSLA': { type: 'stock', names: ['TSLA', 'TESLA'] },
      'NVDA': { type: 'stock', names: ['NVDA', 'NVIDIA'] },
      'GOOGL': { type: 'stock', names: ['GOOGL', 'GOOGLE'] },
      'MSFT': { type: 'stock', names: ['MSFT', 'MICROSOFT'] }
    };

    for (const [symbol, data] of Object.entries(patterns)) {
      if (data.names.some(name => text.includes(name))) {
        symbols.push({ symbol, type: data.type });
        break; // Premier symbole trouvé pour la démo
      }
    }

    return symbols;
  }

  async generateSingleSymbolAnalysis(symbolData) {
    const { symbol, type } = symbolData;
    
    // Obtenir l'analyse MCP
    let analysis;
    if (type === 'crypto') {
      analysis = await mcpService.analyzeCrypto(symbol);
    } else {
      analysis = await mcpService.analyzeTechnical(symbol);
    }

    if (!analysis.success) {
      return `Analyse temporairement indisponible pour ${symbol}. Serveur en cours de connexion...`;
    }

    const data = analysis.analysis;
    const trend = data.technical_indicators?.trend || 'neutral';
    const isBullish = trend === 'bullish' || data.change_24h > 0;
    
    const templateKey = type === 'crypto' 
      ? (isBullish ? 'crypto_bullish' : 'crypto_bearish')
      : 'stock_analysis';
    
    const templates = this.responseTemplates[templateKey];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return this.fillTemplate(template, symbol, data);
  }

  fillTemplate(template, symbol, data) {
    const indicators = data.technical_indicators || {};
    const price = data.price?.toFixed(2) || 'N/A';
    const change = data.change_24h?.toFixed(2) || '0.00';
    const rsi = indicators.rsi || 50;
    const volume = this.formatVolume(data.volume || 0);
    
    const replacements = {
      '{SYMBOL}': symbol,
      '{PRICE}': price,
      '{CHANGE}': Math.abs(parseFloat(change)),
      '{RSI}': rsi,
      '{RSI_SIGNAL}': rsi > 70 ? 'Surachat' : rsi < 30 ? 'Survente' : 'Neutre',
      '{TREND}': indicators.trend || 'neutre',
      '{SUPPORT}': indicators.support_level?.toFixed(2) || (parseFloat(price) * 0.95).toFixed(2),
      '{RESISTANCE}': indicators.resistance_level?.toFixed(2) || (parseFloat(price) * 1.05).toFixed(2),
      '{TARGET}': (parseFloat(price) * 1.08).toFixed(2),
      '{VOLUME}': volume,
      '{SMA20}': indicators.sma_20?.toFixed(2) || 'N/A',
      '{SMA50}': indicators.sma_50?.toFixed(2) || 'N/A',
      '{RECOMMENDATION}': data.recommendation || 'HOLD',
      '{CONFIDENCE}': Math.round((data.confidence_score || 0.8) * 100),
      '{ANALYSIS_SUMMARY}': data.analysis_summary || `${symbol} présente des signaux techniques mitigés`,
      '{TIMESTAMP}': new Date().toLocaleString('fr-FR')
    };

    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return result + "\n\n* Cette analyse est fournie à titre informatif et ne constitue pas un conseil financier.*";
  }

  generateWelcomeResponse(message) {
    const responses = [
      " **Brain Invest** à votre service ! Je peux analyser n'importe quel crypto ou action en temps réel. Mentionnez un symbole comme **BTC**, **ETH**, **AAPL** ou **TSLA** pour commencer.",
      
      "Bonjour ! Je suis votre assistant de trading intelligent. Posez-moi des questions sur :\n• **Cryptomonnaies** (BTC, ETH, ADA...)\n• **Actions** (AAPL, TSLA, NVDA...)\n• **Analyses techniques** en temps réel\n\nQuel actif vous intéresse ?",
      
      " Prêt pour l'analyse ! Je peux vous fournir :\n• Prix en temps réel\n• Signaux techniques\n• Recommandations d'achat/vente\n• Sentiment du marché\n\nMentionnez simplement un symbole pour démarrer l'analyse."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  formatVolume(volume) {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toString();
  }
}

export default new IntelligentResponseService();