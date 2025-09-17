// src/context/MCPContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import mcpService from '../services/mcpService';

const MCPContext = createContext();

export const useMCP = () => {
  const context = useContext(MCPContext);
  if (!context) {
    throw new Error('useMCP must be used within MCPProvider');
  }
  return context;
};

export const MCPProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState(null);
  const [analysisCache, setAnalysisCache] = useState(new Map());
  const [loading, setLoading] = useState(false);

  // Cache TTL de 5 minutes
  const CACHE_TTL = 5 * 60 * 1000;

  // Vérification de santé périodique
  const performHealthCheck = useCallback(async () => {
    try {
      const healthResult = await mcpService.performHealthCheck();
      setIsConnected(healthResult.backend.success && healthResult.mcp_bridge?.success);
      setLastHealthCheck(healthResult);
      console.log('🏥 MCP Health Check:', healthResult);
      return healthResult;
    } catch (error) {
      setIsConnected(false);
      console.error('❌ Health check failed:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Analyse avec cache intelligent
  const analyzeSymbol = useCallback(async (symbol, type = 'stock', forceRefresh = false) => {
    const cacheKey = `${symbol}_${type}`;
    
    // Vérifier le cache
    if (!forceRefresh && analysisCache.has(cacheKey)) {
      const cached = analysisCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`📦 Using cached analysis for ${symbol}`);
        return cached.data;
      }
    }

    setLoading(true);
    try {
      let result;
      if (type === 'crypto') {
        result = await mcpService.analyzeCrypto(symbol);
      } else {
        result = await mcpService.analyzeTechnical(symbol);
      }

      // Mettre à jour le cache
      if (result.success) {
        analysisCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        setAnalysisCache(new Map(analysisCache));
      }

      return result;
    } catch (error) {
      console.error(`Analysis failed for ${symbol}:`, error);
      return {
        success: false,
        symbol,
        error: error.message,
        fallback: true
      };
    } finally {
      setLoading(false);
    }
  }, [analysisCache]);

  // Analyse batch pour plusieurs symboles
  const analyzeBatch = useCallback(async (symbols) => {
    const results = {};
    const promises = symbols.map(async ({ symbol, type }) => {
      const result = await analyzeSymbol(symbol, type);
      results[symbol] = result;
    });

    await Promise.allSettled(promises);
    return results;
  }, [analyzeSymbol]);

  // Recommandation rapide avec cache
  const getQuickRecommendation = useCallback(async (symbol) => {
    try {
      const result = await mcpService.getQuickRecommendation(symbol);
      return result;
    } catch (error) {
      return {
        success: false,
        symbol,
        error: error.message,
        recommendation: 'Service temporairement indisponible'
      };
    }
  }, []);

  // Nettoyage du cache
  const clearCache = useCallback(() => {
    setAnalysisCache(new Map());
    console.log('🧹 Analysis cache cleared');
  }, []);

  // Vérification de connectivité au montage
  useEffect(() => {
    performHealthCheck();
    
    // Vérification périodique toutes les 30 secondes
    const healthCheckInterval = setInterval(performHealthCheck, 30000);
    
    return () => clearInterval(healthCheckInterval);
  }, [performHealthCheck]);

  // Nettoyage automatique du cache (toutes les heures)
  useEffect(() => {
    const cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = false;
      
      analysisCache.forEach((value, key) => {
        if (now - value.timestamp > CACHE_TTL) {
          analysisCache.delete(key);
          cleaned = true;
        }
      });
      
      if (cleaned) {
        setAnalysisCache(new Map(analysisCache));
        console.log('🧹 Expired cache entries removed');
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(cacheCleanupInterval);
  }, [analysisCache]);

  const value = {
    // État
    isConnected,
    loading,
    lastHealthCheck,
    cacheSize: analysisCache.size,
    
    // Actions
    performHealthCheck,
    analyzeSymbol,
    analyzeBatch,
    getQuickRecommendation,
    clearCache,
    
    // Services directs
    mcpService
  };

  return (
    <MCPContext.Provider value={value}>
      {children}
    </MCPContext.Provider>
  );
};

// Hook pour l'analyse en temps réel
export const useRealTimeAnalysis = (symbol, type, autoRefresh = true) => {
  const { analyzeSymbol, isConnected } = useMCP();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshAnalysis = useCallback(async () => {
    if (!symbol || !isConnected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeSymbol(symbol, type);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [symbol, type, analyzeSymbol, isConnected]);

  useEffect(() => {
    refreshAnalysis();
  }, [refreshAnalysis]);

  // Refresh automatique toutes les 2 minutes si autoRefresh est activé
  useEffect(() => {
    if (!autoRefresh || !isConnected) return;
    
    const interval = setInterval(refreshAnalysis, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshAnalysis, isConnected]);

  return {
    data,
    error,
    loading,
    refresh: refreshAnalysis,
    isConnected
  };
};