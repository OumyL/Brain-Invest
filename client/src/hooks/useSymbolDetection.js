// src/hooks/useSymbolDetection.js - Version améliorée
import { useState, useEffect, useMemo, useCallback } from 'react';

// Base de données des symboles étendues
const SYMBOL_DATABASE = {
  crypto: {
    'BTC': { names: ['BTC', 'BITCOIN'], market: 'crypto', priority: 1 },
    'ETH': { names: ['ETH', 'ETHEREUM'], market: 'crypto', priority: 1 },
    'ADA': { names: ['ADA', 'CARDANO'], market: 'crypto', priority: 2 },
    'SOL': { names: ['SOL', 'SOLANA'], market: 'crypto', priority: 2 },
    'DOT': { names: ['DOT', 'POLKADOT'], market: 'crypto', priority: 2 },
    'MATIC': { names: ['MATIC', 'POLYGON'], market: 'crypto', priority: 2 },
    'AVAX': { names: ['AVAX', 'AVALANCHE'], market: 'crypto', priority: 2 },
    'LINK': { names: ['LINK', 'CHAINLINK'], market: 'crypto', priority: 2 },
    'UNI': { names: ['UNI', 'UNISWAP'], market: 'crypto', priority: 2 },
    'DOGE': { names: ['DOGE', 'DOGECOIN'], market: 'crypto', priority: 3 },
    'XRP': { names: ['XRP', 'RIPPLE'], market: 'crypto', priority: 2 },
    'LTC': { names: ['LTC', 'LITECOIN'], market: 'crypto', priority: 3 },
    'BCH': { names: ['BCH', 'BITCOIN CASH'], market: 'crypto', priority: 3 }
  },
  stocks: {
    'AAPL': { names: ['AAPL', 'APPLE'], market: 'nasdaq', priority: 1 },
    'MSFT': { names: ['MSFT', 'MICROSOFT'], market: 'nasdaq', priority: 1 },
    'GOOGL': { names: ['GOOGL', 'GOOGLE', 'ALPHABET'], market: 'nasdaq', priority: 1 },
    'AMZN': { names: ['AMZN', 'AMAZON'], market: 'nasdaq', priority: 1 },
    'TSLA': { names: ['TSLA', 'TESLA'], market: 'nasdaq', priority: 1 },
    'META': { names: ['META', 'FACEBOOK'], market: 'nasdaq', priority: 1 },
    'NVDA': { names: ['NVDA', 'NVIDIA'], market: 'nasdaq', priority: 1 },
    'NFLX': { names: ['NFLX', 'NETFLIX'], market: 'nasdaq', priority: 2 },
    'AMD': { names: ['AMD'], market: 'nasdaq', priority: 2 },
    'INTC': { names: ['INTC', 'INTEL'], market: 'nasdaq', priority: 2 },
    'CRM': { names: ['CRM', 'SALESFORCE'], market: 'nasdaq', priority: 2 },
    'ORCL': { names: ['ORCL', 'ORACLE'], market: 'nasdaq', priority: 2 },
    'IBM': { names: ['IBM'], market: 'nasdaq', priority: 3 },
    'DIS': { names: ['DIS', 'DISNEY'], market: 'nasdaq', priority: 2 },
    'V': { names: ['VISA'], market: 'nasdaq', priority: 2 },
    'MA': { names: ['MASTERCARD'], market: 'nasdaq', priority: 2 },
    'JPM': { names: ['JPM', 'JP MORGAN'], market: 'nasdaq', priority: 2 },
    'BAC': { names: ['BAC', 'BANK OF AMERICA'], market: 'nasdaq', priority: 2 }
  }
};

export const useSymbolDetection = (message, options = {}) => {
  const { 
    debounceMs = 300,
    caseSensitive = false,
    multipleSymbols = true,
    prioritizeRecent = true 
  } = options;

  const [detectedSymbols, setDetectedSymbols] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);

  // Cache des patterns compilés pour performance
  const compiledPatterns = useMemo(() => {
    const patterns = new Map();
    
    Object.entries(SYMBOL_DATABASE).forEach(([type, symbols]) => {
      Object.entries(symbols).forEach(([symbol, data]) => {
        data.names.forEach(name => {
          const key = caseSensitive ? name : name.toUpperCase();
          patterns.set(key, {
            symbol,
            type: type === 'crypto' ? 'crypto' : 'stock',
            priority: data.priority,
            market: data.market
          });
        });
      });
    });
    
    return patterns;
  }, [caseSensitive]);

  // Fonction de détection optimisée
  const detectSymbols = useCallback((text) => {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const processedText = caseSensitive ? text : text.toUpperCase();
    const words = processedText.split(/\s+/);
    const detected = new Map(); // Utiliser Map pour éviter les doublons

    // Recherche par mots-clés exacts
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, ''); // Supprimer ponctuation
      const match = compiledPatterns.get(cleanWord);
      
      if (match) {
        const key = `${match.symbol}_${match.type}`;
        if (!detected.has(key) || detected.get(key).priority > match.priority) {
          detected.set(key, {
            ...match,
            detectedAs: word,
            confidence: 1.0
          });
        }
      }
    });

    // Recherche par regex pour les symboles génériques (3-5 lettres)
    if (detected.size === 0) {
      const genericRegex = /\b([A-Z]{3,5})\b/g;
      let match;
      
      while ((match = genericRegex.exec(processedText)) !== null && detected.size < 3) {
        const potentialSymbol = match[1];
        
        // Éviter les faux positifs courants
        const excludeList = ['AND', 'THE', 'FOR', 'YOU', 'ARE', 'NOT', 'BUT', 'CAN', 'ALL', 'ONE', 'OUT', 'DAY', 'GET', 'USE', 'MAN', 'NEW', 'NOW', 'OLD', 'SEE', 'HIM', 'TWO', 'HOW', 'ITS', 'OUR', 'MAY', 'SAY', 'SHE', 'HAS', 'HER'];
        
        if (!excludeList.includes(potentialSymbol)) {
          const key = `${potentialSymbol}_stock`;
          detected.set(key, {
            symbol: potentialSymbol,
            type: 'stock',
            priority: 4,
            detectedAs: match[0],
            confidence: 0.6,
            generic: true
          });
        }
      }
    }

    // Convertir en array et trier par priorité
    let results = Array.from(detected.values());
    
    if (!multipleSymbols && results.length > 1) {
      results = results.sort((a, b) => a.priority - b.priority).slice(0, 1);
    } else {
      results = results.sort((a, b) => a.priority - b.priority);
    }

    return results;
  }, [compiledPatterns, caseSensitive, multipleSymbols]);

  // Effet avec debounce
  useEffect(() => {
    if (!message) {
      setDetectedSymbols([]);
      setLastDetection(null);
      return;
    }

    setIsDetecting(true);
    
    const timeoutId = setTimeout(() => {
      const detected = detectSymbols(message);
      setDetectedSymbols(detected);
      setLastDetection({
        timestamp: Date.now(),
        message: message.substring(0, 100), // Stocker début du message pour debug
        count: detected.length
      });
      setIsDetecting(false);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [message, detectSymbols, debounceMs]);

  // Méthodes utilitaires
  const getMainSymbol = useCallback(() => {
    return detectedSymbols.length > 0 ? detectedSymbols[0] : null;
  }, [detectedSymbols]);

  const getSymbolsByType = useCallback((type) => {
    return detectedSymbols.filter(symbol => symbol.type === type);
  }, [detectedSymbols]);

  const getTradingViewSymbol = useCallback((symbolData = null) => {
    const symbol = symbolData || getMainSymbol();
    if (!symbol) return null;
    
    if (symbol.type === 'crypto') {
      return `${symbol.symbol}USD`;
    }
    return symbol.symbol;
  }, [getMainSymbol]);

  const hasSymbol = detectedSymbols.length > 0;
  const hasCrypto = detectedSymbols.some(s => s.type === 'crypto');
  const hasStock = detectedSymbols.some(s => s.type === 'stock');

  return {
    // État principal
    detectedSymbols,
    isDetecting,
    hasSymbol,
    
    // Symboles par type
    cryptoSymbols: getSymbolsByType('crypto'),
    stockSymbols: getSymbolsByType('stock'),
    
    // Symbole principal (le plus prioritaire)
    mainSymbol: getMainSymbol(),
    
    // Informations sur le type
    hasCrypto,
    hasStock,
    symbolType: hasSymbol ? getMainSymbol()?.type : null,
    
    // Méthodes utilitaires
    getTradingViewSymbol,
    getSymbolsByType,
    
    // Métadonnées
    detectionMeta: {
      lastDetection,
      confidence: hasSymbol ? detectedSymbols[0]?.confidence : 0,
      isGeneric: hasSymbol ? detectedSymbols[0]?.generic || false : false
    },
    
    // Méthodes de contrôle
    forceRedetect: () => setLastDetection(null),
    clearDetection: () => {
      setDetectedSymbols([]);
      setLastDetection(null);
    }
  };
};

// Hook spécialisé pour l'analyse en temps réel
export const useRealTimeSymbolAnalysis = (message, autoAnalyze = true) => {
  const detection = useSymbolDetection(message, {
    debounceMs: 500,
    multipleSymbols: false // Un seul symbole pour l'analyse temps réel
  });

  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Auto-analyse quand un symbole est détecté
  useEffect(() => {
    const analyzeSymbol = async () => {
      if (!detection.hasSymbol || !autoAnalyze) return;

      const symbol = detection.mainSymbol;
      setAnalysisLoading(true);
      setAnalysisError(null);

      try {
        // Ici vous pouvez intégrer votre service MCP
        // const result = await mcpService.analyzeSymbol(symbol.symbol, symbol.type);
        // setAnalysisData(result);
        
        // Simulation pour l'exemple
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnalysisData({
          symbol: symbol.symbol,
          type: symbol.type,
          status: 'analyzed',
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        setAnalysisError(error);
      } finally {
        setAnalysisLoading(false);
      }
    };

    analyzeSymbol();
  }, [detection.hasSymbol, detection.mainSymbol?.symbol, autoAnalyze]);

  return {
    ...detection,
    analysis: {
      data: analysisData,
      loading: analysisLoading,
      error: analysisError,
      hasData: !!analysisData
    }
  };
};