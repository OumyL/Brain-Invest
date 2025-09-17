// src/components/trading/AnalysisPanel.jsx - Version avec synchronisation de thème
import React, { useState, useEffect, useCallback } from 'react';
import { useSymbolDetection } from '../../hooks/useSymbolDetection';
import TradingViewChart from './TradingViewChart';
import mcpService from '../../services/mcpService';

const AnalysisPanel = ({ currentMessage }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const detectionResult = useSymbolDetection(currentMessage);
  const { detectedSymbol, symbolType, getTradingViewSymbol, hasSymbol } = detectionResult;

  // Analyse automatique
  const runAnalysis = useCallback(async () => {
    if (!detectedSymbol) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let result;
      if (symbolType === 'crypto') {
        result = await mcpService.analyzeCrypto(detectedSymbol);
      } else {
        result = await mcpService.analyzeTechnical(detectedSymbol);
      }
      
      setAnalysisData(result);
      
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  }, [detectedSymbol, symbolType]);

  useEffect(() => {
    if (hasSymbol && detectedSymbol) {
      runAnalysis();
    }
  }, [hasSymbol, detectedSymbol, runAnalysis]);

  // Vue par défaut - État d'attente
  if (!hasSymbol) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="text-6xl">📈</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Panneau d'analyse
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mentionnez un symbole pour voir le graphique
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tradingViewSymbol = getTradingViewSymbol();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      
      {/* Graphique TradingView avec thème automatique */}
      <div className="flex-1 min-h-0">
        <TradingViewChart 
          symbol={tradingViewSymbol}
          containerStyle={{
            width: '100%',
            height: '100%'
          }}
        />
      </div>

      {/* Résultats d'analyse compacts en bas */}
      {analysisData && (
        <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                📊 {detectedSymbol}
              </h4>
              {analysisData.analysis?.recommendation && (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  analysisData.analysis.recommendation === 'BUY' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : analysisData.analysis.recommendation === 'SELL'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {analysisData.analysis.recommendation}
                </span>
              )}
            </div>
            {loading && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          
          {analysisData.success ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Prix</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${analysisData.analysis?.price?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Variation 24h</span>
                <span className={`font-semibold ${
                  (analysisData.analysis?.change_24h || 0) >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {(analysisData.analysis?.change_24h || 0).toFixed(2)}%
                </span>
              </div>
              {analysisData.analysis?.technical_indicators?.rsi && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">RSI</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {analysisData.analysis.technical_indicators.rsi}
                  </span>
                </div>
              )}
              {analysisData.analysis?.volume && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Volume</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(analysisData.analysis.volume / 1000000).toFixed(1)}M
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              Données en cours de chargement...
            </div>
          )}
          
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            Mis à jour: {new Date().toLocaleTimeString('fr-FR')}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;