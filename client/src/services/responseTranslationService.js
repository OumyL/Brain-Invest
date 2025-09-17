// src/services/responseTranslationService.js
// Nouveau service pour standardiser toutes les réponses en français

class ResponseTranslationService {
  constructor() {
    // Dictionnaire de traduction pour tous les termes techniques
    this.translations = {
      // Titres et headers
      'Stock Analysis': 'Analyse Technique',
      'Crypto Analysis': 'Analyse Crypto',
      'Fundamental Analysis': 'Analyse Fondamentale',
      'Investment Thesis': 'Thèse d\'Investissement',
      'News Sentiment': 'Sentiment des Actualités',
      'Market Overview': 'Aperçu du Marché',
      
      // Signaux et recommandations
      'Overall Signal': 'Signal Global',
      'Signal Strength': 'Force du Signal',
      'Strong BUY': 'ACHAT FORT',
      'BUY': 'ACHAT',
      'HOLD': 'CONSERVER',
      'SELL': 'VENDRE',
      'Strong SELL': 'VENTE FORTE',
      'VENTE FORTE': 'VENTE FORTE', // Déjà en français
      'ACHAT FORT': 'ACHAT FORT', // Déjà en français
      
      // Analyse technique
      'Trend Analysis': 'Analyse de Tendance',
      'Trading Signals': 'Signaux de Trading',
      'Technical Indicators': 'Indicateurs Techniques',
      'Key Metrics': 'Métriques Clés',
      'Momentum': 'Momentum',
      'Latest Price': 'Prix Actuel',
      'Volume Avg': 'Volume Moyen',
      'Data Source': 'Source de Données',
      'Data Reliability': 'Fiabilité des Données',
      
      // Tendances et directions
      'Bullish': 'Haussière',
      'Bearish': 'Baissière',
      'Neutral': 'Neutre',
      'Above': 'Au-dessus',
      'Below': 'En-dessous',
      'Cross': 'Croisement',
      'Zone': 'Zone',
      'Touching': 'Touchant',
      'Upper': 'Supérieure',
      'Lower': 'Inférieure',
      'Bollinger Band': 'Bande de Bollinger',
      'Bollinger Bands': 'Bandes de Bollinger',
      'Squeeze': 'Compression',
      'Overbought': 'Surachat',
      'Oversold': 'Survente',
      'Position': 'Position',
      
      // Analyse fondamentale
      'Company Overview': 'Aperçu de l\'Entreprise',
      'Valuation Metrics': 'Métriques de Valorisation',
      'Profitability': 'Rentabilité',
      'Financial Health': 'Santé Financière',
      'Valuation Assessment': 'Évaluation de la Valorisation',
      'Quality Score': 'Score de Qualité',
      'Key Signals': 'Signaux Clés',
      'Quality Factors': 'Facteurs de Qualité',
      'Investment Strengths': 'Points Forts d\'Investissement',
      'Investment Concerns': 'Préoccupations d\'Investissement',
      'Key Metrics Summary': 'Résumé des Métriques Clés',
      'Market Cap': 'Capitalisation Boursière',
      'Profit Margin': 'Marge Bénéficiaire',
      'Operating Margin': 'Marge Opérationnelle',
      'Dividend Yield': 'Rendement du Dividende',
      'Current Ratio': 'Ratio de Liquidité',
      'Debt-to-Equity': 'Dette/Capitaux Propres',
      
      // Classifications de valorisation
      'TRÈS SURÉVALUÉE': 'TRÈS SURÉVALUÉE',
      'SURÉVALUÉE': 'SURÉVALUÉE',
      'VALORISATION NEUTRE': 'VALORISATION NEUTRE',
      'ATTRACTIVE': 'ATTRACTIVE',
      'TRÈS ATTRACTIVE': 'TRÈS ATTRACTIVE',
      
      // Grades de qualité
      'Entreprise de Très Haute Qualité': 'Entreprise de Très Haute Qualité',
      'Entreprise de Haute Qualité': 'Entreprise de Haute Qualité',
      'Entreprise de Qualité Moyenne': 'Entreprise de Qualité Moyenne',
      'Entreprise de Qualité Faible': 'Entreprise de Qualité Faible',
      
      // Niveaux de confiance
      'Confidence Level': 'Niveau de Confiance',
      'Très Élevée': 'Très Élevée',
      'Élevée': 'Élevée',
      'Moyenne-Haute': 'Moyenne-Haute',
      'Moyenne': 'Moyenne',
      'Faible': 'Faible',
      
      // Sentiment des actualités
      'Article Breakdown': 'Répartition des Articles',
      'Total': 'Total',
      'Positive': 'Positifs',
      'Negative': 'Négatifs',
      'Classification': 'Classification',
      'Confidence': 'Confiance',
      'Trend': 'Tendance',
      'Strength': 'Force',
      'Key Themes': 'Thèmes Clés',
      'Declining': 'En Déclin',
      'Rising': 'En Hausse',
      'Stable': 'Stable',
      
      // Secteurs
      'TECHNOLOGY': 'TECHNOLOGIE',
      'CONSUMER CYCLICAL': 'CONSOMMATION CYCLIQUE',
      'COMMUNICATION SERVICES': 'SERVICES DE COMMUNICATION',
      'CONSUMER ELECTRONICS': 'ÉLECTRONIQUE GRAND PUBLIC',
      'SOFTWARE - INFRASTRUCTURE': 'LOGICIELS - INFRASTRUCTURE',
      'INTERNET CONTENT & INFORMATION': 'CONTENU INTERNET ET INFORMATION',
      'INTERNET RETAIL': 'COMMERCE EN LIGNE',
      'AUTO MANUFACTURERS': 'CONSTRUCTEURS AUTOMOBILES',
      
      // Statuts et états
      'Primary': 'Primaire',
      'Fallback': 'Secours',
      'Unknown': 'Inconnu',
      'Operational': 'Opérationnel',
      'Not Available': 'Non Disponible',
      'Insufficient Data': 'Données Insuffisantes'
    };
    
    // Patterns regex pour les traductions contextuelles
    this.regexPatterns = [
      // Moyennes mobiles
      {
        pattern: /Above (\d+) SMA/g,
        replacement: 'Au-dessus MM$1'
      },
      {
        pattern: /Below (\d+) SMA/g,
        replacement: 'En-dessous MM$1'
      },
      {
        pattern: /(\d+)\/(\d+) SMA (Bullish|Bearish) Cross/g,
        replacement: (match, p1, p2, p3) => {
          const trend = p3 === 'Bullish' ? 'Haussier' : 'Baissier';
          return `Croisement MM${p1}/${p2} ${trend}`;
        }
      },
      
      // RSI
      {
        pattern: /RSI \((\d+)\): ([\d.]+)/g,
        replacement: 'RSI ($1): $2'
      },
      {
        pattern: /RSI (Neutral Zone|Overbought|Oversold) \(([\d.]+)\)/g,
        replacement: (match, p1, p2) => {
          const zones = {
            'Neutral Zone': 'Zone Neutre',
            'Overbought': 'Surachat',
            'Oversold': 'Survente'
          };
          return `RSI ${zones[p1]} (${p2})`;
        }
      },
      
      // MACD
      {
        pattern: /MACD (Bullish|Bearish) (Signal|Cross)/g,
        replacement: (match, p1, p2) => {
          const trend = p1 === 'Bullish' ? 'Haussier' : 'Baissier';
          const type = p2 === 'Signal' ? 'Signal' : 'Croisement';
          return `MACD ${type} ${trend}`;
        }
      },
      
      // Stochastique
      {
        pattern: /Stochastic (Overbought|Oversold) \(([\d.]+)\)/g,
        replacement: (match, p1, p2) => {
          const status = p1 === 'Overbought' ? 'Surachat' : 'Survente';
          return `Stochastique ${status} (${p2})`;
        }
      },
      
      // Pourcentages et valeurs
      {
        pattern: /Strength: ([\d.]+)%/g,
        replacement: 'Force: $1%'
      },
      {
        pattern: /Score: ([\d.]+)\/100/g,
        replacement: 'Score: $1/100'
      }
    ];
  }
  
  // Méthode principale pour traduire une réponse complète
  translateResponse(content) {
    if (!content || typeof content !== 'string') {
      return content;
    }
    
    let translatedContent = content;
    
    // 1. Appliquer les traductions directes
    Object.entries(this.translations).forEach(([english, french]) => {
      // Traduction exacte avec délimiteurs de mots
      const exactRegex = new RegExp(`\\b${this.escapeRegex(english)}\\b`, 'g');
      translatedContent = translatedContent.replace(exactRegex, french);
      
      // Traduction dans les titres avec **
      const titleRegex = new RegExp(`\\*\\*${this.escapeRegex(english)}\\*\\*`, 'g');
      translatedContent = translatedContent.replace(titleRegex, `**${french}**`);
      
      // Traduction après ':' et '-'
      const colonRegex = new RegExp(`([:-]\\s*)${this.escapeRegex(english)}`, 'g');
      translatedContent = translatedContent.replace(colonRegex, `$1${french}`);
    });
    
    // 2. Appliquer les patterns regex contextuels
    this.regexPatterns.forEach(({ pattern, replacement }) => {
      if (typeof replacement === 'function') {
        translatedContent = translatedContent.replace(pattern, replacement);
      } else {
        translatedContent = translatedContent.replace(pattern, replacement);
      }
    });
    
    // 3. Traductions spéciales pour les émojis et statuts
    translatedContent = this.translateSpecialCases(translatedContent);
    
    // 4. Nettoyer et finaliser
    translatedContent = this.cleanupTranslation(translatedContent);
    
    return translatedContent;
  }
  
  // Traductions spéciales pour cas complexes
  translateSpecialCases(content) {
    let result = content;
    
    // Traductions des signaux avec émojis
    const signalTranslations = [
      {
        pattern: /🚀 \*\*Overall Signal: Strong BUY\*\*/g,
        replacement: '🚀 **Signal Global: ACHAT FORT**'
      },
      {
        pattern: /📈 \*\*Overall Signal: BUY\*\*/g,
        replacement: '📈 **Signal Global: ACHAT**'
      },
      {
        pattern: /⚖️ \*\*Overall Signal: HOLD\*\*/g,
        replacement: '⚖️ **Signal Global: CONSERVER**'
      },
      {
        pattern: /📉 \*\*Overall Signal: SELL\*\*/g,
        replacement: '📉 **Signal Global: VENDRE**'
      },
      {
        pattern: /🔻 \*\*Final Recommendation: (.*?)\*\*/g,
        replacement: '🔻 **Recommandation Finale: $1**'
      },
      {
        pattern: /📈 \*\*Final Recommendation: (.*?)\*\*/g,
        replacement: '📈 **Recommandation Finale: $1**'
      }
    ];
    
    signalTranslations.forEach(({ pattern, replacement }) => {
      result = result.replace(pattern, replacement);
    });
    
    // Traduction des sources de données
    result = result.replace(/\*\*Data Source: (.*?)\*\*/g, '**Source de Données: $1**');
    
    // Traduction des titres de sections
    const sectionTitles = [
      ['###.*Trend Analysis:', '### 📊 Analyse de Tendance:'],
      ['###.*Trading Signals:', '### 🎯 Signaux de Trading:'],
      ['###.*Key Metrics:', '### 📈 Métriques Clés:'],
      ['###.*Bollinger Bands:', '### 📊 Bandes de Bollinger:'],
      ['###.*Stochastic:', '### ⚡ Stochastique:']
    ];
    
    sectionTitles.forEach(([pattern, replacement]) => {
      result = result.replace(new RegExp(pattern, 'g'), replacement);
    });
    
    return result;
  }
  
  // Nettoyage final de la traduction
  cleanupTranslation(content) {
    let result = content;
    
    // Supprimer les doublons de traduction
    result = result.replace(/Signal Global Global/g, 'Signal Global');
    result = result.replace(/Analyse Technique Technique/g, 'Analyse Technique');
    
    // Corriger les espaces autour des deux-points
    result = result.replace(/(\w+)\s*:\s*([✅❌⚖️])/g, '$1: $2');
    
    // Normaliser les pourcentages
    result = result.replace(/(\d+\.?\d*)\s*%/g, '$1%');
    
    // Corriger les formats de prix
    result = result.replace(/\$\s+/g, '$');
    
    return result;
  }
  
  // Échapper les caractères spéciaux pour regex
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // Méthode pour traduire les titres de métriques spécifiques
  translateMetricTitles(content) {
    const metricTranslations = {
      'P/E Ratio': 'Ratio P/E',
      'P/B Ratio': 'Ratio P/B',
      'EPS': 'BPA', // Bénéfice Par Action
      'ROE': 'RCP', // Rendement des Capitaux Propres
      'ROA': 'RDA', // Rendement des Actifs
      'Beta': 'Bêta',
      'ATR': 'ATR', // Average True Range - garde l'acronyme
      'SMA': 'MM',  // Simple Moving Average -> Moyenne Mobile
      'MACD': 'MACD' // Garde l'acronyme connu
    };
    
    let result = content;
    Object.entries(metricTranslations).forEach(([english, french]) => {
      // Dans les contextes de métriques
      result = result.replace(new RegExp(`- \\*\\*${english}:\\*\\*`, 'g'), `- **${french}:**`);
      result = result.replace(new RegExp(`\\*\\*${english}:\\*\\*`, 'g'), `**${french}:**`);
    });
    
    return result;
  }
  
  // Méthode pour identifier la langue d'une réponse
  detectLanguage(content) {
    const englishIndicators = [
      'Stock Analysis', 'Crypto Analysis', 'Overall Signal',
      'Signal Strength', 'Trading Signals', 'Trend Analysis'
    ];
    
    const frenchIndicators = [
      'Analyse Technique', 'Analyse Crypto', 'Signal Global',
      'Force du Signal', 'Signaux de Trading', 'Analyse de Tendance'
    ];
    
    const englishCount = englishIndicators.reduce((count, indicator) => 
      count + (content.includes(indicator) ? 1 : 0), 0
    );
    
    const frenchCount = frenchIndicators.reduce((count, indicator) => 
      count + (content.includes(indicator) ? 1 : 0), 0
    );
    
    if (englishCount > frenchCount) return 'english';
    if (frenchCount > englishCount) return 'french';
    return 'mixed';
  }
  
  // Méthode pour forcer la traduction complète
  forceFullTranslation(content) {
    const language = this.detectLanguage(content);
    
    if (language === 'english' || language === 'mixed') {
      let translated = this.translateResponse(content);
      translated = this.translateMetricTitles(translated);
      return translated;
    }
    
    return content;
  }
}

// Service singleton
const responseTranslationService = new ResponseTranslationService();

// Export par défaut
export default responseTranslationService;

// Fonction helper pour intégration rapide
export const translateToFrench = (content) => {
  return responseTranslationService.forceFullTranslation(content);
};

// Méthode pour vérifier si une traduction est nécessaire
export const needsTranslation = (content) => {
  const language = responseTranslationService.detectLanguage(content);
  return language === 'english' || language === 'mixed';
};