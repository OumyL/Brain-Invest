// src/components/trading/TradingViewChart.jsx - Version améliorée avec esthétique mode sombre
import React, { useEffect, useRef, useState } from 'react';

const TradingViewChart = ({ symbol = 'BTCUSD', containerStyle = {} }) => {
  const containerRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [useIframe, setUseIframe] = useState(false);
  
  // Détecter le thème actuel de l'interface
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Observer les changements de thème
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const hasDarkClass = document.documentElement.classList.contains('dark');
          setIsDarkMode(hasDarkClass);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Réinitialiser le chargement quand le thème ou le symbole change
    setUseIframe(false);
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setUseIframe(true);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [symbol, isDarkMode]);

  // Configuration couleurs améliorée pour le mode sombre
  const currentTheme = isDarkMode ? 'dark' : 'light';
  const backgroundColor = isDarkMode ? '111111' : 'ffffff';
  const gridColor = isDarkMode ? '1f2937' : 'f3f4f6';
  const textColor = isDarkMode ? '9ca3af' : '374151';
  
  // URL iframe avec configuration esthétique améliorée
  const iframeSrc = `https://www.tradingview.com/widgetembed/?frameElementId=tradingview_${symbol}&symbol=${symbol}&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=${backgroundColor}&studies=[]&theme=${currentTheme}&style=1&timezone=Etc%2FUTC&withdateranges=1&locale=fr`;

  if (useIframe) {
    return (
      <div 
        className="w-full h-full rounded-lg overflow-hidden relative"
        style={{
          ...containerStyle,
          backgroundColor: isDarkMode ? '#111111' : '#ffffff',
          border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb'
        }}
      >
        {/* Header avec contrôles */}
        <div 
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
            borderColor: isDarkMode ? '#374151' : '#e5e7eb'
          }}
        >
          <div className="flex items-center space-x-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#10b981' }}
            ></div>
            <span 
              className="text-sm font-medium"
              style={{ color: isDarkMode ? '#f3f4f6' : '#374151' }}
            >
              {symbol}
            </span>
          </div>
          
          {/* Boutons de contrôle stylisés */}
          <div className="flex items-center space-x-1">
            <button
              className="w-6 h-6 rounded flex items-center justify-center transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: isDarkMode ? '#9ca3af' : '#6b7280'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
              title="Paramètres du graphique"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Iframe TradingView */}
        <div className="relative" style={{ height: 'calc(100% - 40px)' }}>
          <iframe
            key={`${symbol}-${currentTheme}`}
            src={iframeSrc}
            width="100%"
            height="100%"
            frameBorder="0"
            allowtransparency="true"
            scrolling="no"
            allowFullScreen={true}
            title={`Graphique ${symbol}`}
            style={{ 
              display: 'block',
              border: 'none',
              margin: 0,
              padding: 0,
              minHeight: '400px',
              backgroundColor: isDarkMode ? '#111111' : '#ffffff'
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
          
          {/* Overlay de chargement */}
          {isLoading && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: isDarkMode ? 'rgba(17, 17, 17, 0.9)' : 'rgba(255, 255, 255, 0.9)' }}
            >
              <div className="text-center">
                <div 
                  className="animate-spin rounded-full h-8 w-8 border-2 border-transparent mx-auto mb-4"
                  style={{ 
                    borderTopColor: '#0d9488',
                    borderRightColor: '#0d9488'
                  }}
                ></div>
                <p 
                  className="text-sm"
                  style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                >
                  Chargement du graphique {symbol}...
                </p>
              </div>
            </div>
          )}

          {/* Indicateur de connexion */}
          <div 
            className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
            style={{
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(249, 250, 251, 0.8)',
              color: isDarkMode ? '#10b981' : '#059669'
            }}
          >
            <div 
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: '#10b981' }}
            ></div>
            <span>Live</span>
          </div>
        </div>
      </div>
    );
  }

  // Version de chargement initial améliorée
  return (
    <div 
      className="w-full h-full rounded-lg overflow-hidden" 
      style={{
        ...containerStyle,
        backgroundColor: isDarkMode ? '#111111' : '#ffffff',
        border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb'
      }}
    >
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ 
          minHeight: '400px',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #111111 0%, #1f2937 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
        }}
      >
        <div className="text-center">
          {/* Icône animée */}
          <div className="relative mb-6">
            <div 
              className="text-6xl opacity-20"
              style={{ color: isDarkMode ? '#374151' : '#d1d5db' }}
            >
              📊
            </div>
            <div 
              className="absolute inset-0 flex items-center justify-center"
            >
              <div 
                className="animate-spin rounded-full h-8 w-8 border-2 border-transparent"
                style={{ 
                  borderTopColor: '#0d9488',
                  borderRightColor: '#0d9488'
                }}
              ></div>
            </div>
          </div>
          
          {/* Texte de chargement */}
          <p 
            className="text-lg font-medium mb-2"
            style={{ color: isDarkMode ? '#f3f4f6' : '#374151' }}
          >
            Préparation du graphique {symbol}
          </p>
          <p 
            className="text-sm mb-4"
            style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
          >
            Mode {isDarkMode ? 'sombre' : 'clair'} activé
          </p>
          
          {/* Barre de progression stylisée */}
          <div 
            className="w-48 h-1 rounded-full overflow-hidden mx-auto"
            style={{ backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }}
          >
            <div 
              className="h-full rounded-full animate-pulse"
              style={{ 
                background: 'linear-gradient(90deg, #0d9488 0%, #14b8a6 50%, #0d9488 100%)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewChart;