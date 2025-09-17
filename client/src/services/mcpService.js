// src/services/mcpService.js
import axios from 'axios';
import responseTranslationService from './responseTranslationService';

class MCPService {
  constructor() {
    this.baseURL = 'http://localhost:8000'; // Bridge MCP
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    this.client.interceptors.request.use((config) => {
      console.log('🚀 MCP Bridge Request:', config.url);
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ MCP Bridge Success');
        return response;
      },
      (error) => {
        console.log('⚠️ MCP Bridge Error, using fallback');
        return Promise.resolve({
          data: { content: this.generateDemoAnalysis() }
        });
      }
    );
  }

  async callMCPTool(toolName, args = {}) {
    try {
      const response = await this.client.post('/mcp/tools/call', {
        name: toolName,
        arguments: args
      });
      
      return {
        success: true,
        content: response.data.content,
        source: 'mcp_python_server'
      };
    } catch (error) {
      console.error(`MCP tool ${toolName} failed:`, error);
      return {
        success: false,
        error: error.message,
        content: this.generateDemoAnalysis()
      };
    }
  }

  async analyzeTechnical(symbol) {
    const result = await this.callMCPTool('analyze_stock', { symbol: symbol.toUpperCase() });
    return this.formatAnalysisResponse(result, symbol, 'stock');
  }

  async analyzeCrypto(symbol, quoteCurrency = 'usd') {
    const result = await this.callMCPTool('analyze_crypto', {
      symbol: symbol.toUpperCase(),
      quote_currency: quoteCurrency,
      provider: 'auto'
    });
    return this.formatAnalysisResponse(result, symbol, 'crypto');
  }

  async getSystemDiagnostic() {
    return await this.callMCPTool('system_diagnostic', {});
  }

  formatAnalysisResponse(mcpResult, symbol, type) {
    if (!mcpResult.success) {
      return this.generateDemoData(symbol);
    }

    let content = mcpResult.content;
    
    // NOUVELLE LIGNE: Traduire automatiquement le contenu en français
    content = responseTranslationService.forceFullTranslation(content);
    
    return {
      success: true,
      symbol: symbol,
      analysis: {
        price: this.extractValue(content, /Prix.*?\$([0-9,]+\.?[0-9]*)/i),
        change_24h: this.extractValue(content, /([+-]?[0-9]+\.?[0-9]*)%/),
        volume: this.extractVolume(content),
        technical_indicators: {
          rsi: this.extractValue(content, /RSI.*?([0-9]+\.?[0-9]*)/i),
          trend: content.includes('haussier') || content.includes('Haussière') || content.includes('bullish') ? 'bullish' : 'bearish',
          support_level: this.extractValue(content, /(Support|Support).*?\$([0-9,]+\.?[0-9]*)/i),
          resistance_level: this.extractValue(content, /(Résistance|Resistance).*?\$([0-9,]+\.?[0-9]*)/i),
          recommendation: this.extractRecommendation(content)
        },
        recommendation: this.extractRecommendation(content),
        confidence_score: this.extractValue(content, /([0-9]+)\/100/) / 100 || 0.8
      },
      raw_content: content, // Contenu déjà traduit
      timestamp: new Date().toISOString(),
      source: mcpResult.source
    };
  }

  extractValue(text, regex) {
    const match = text.match(regex);
    return match ? parseFloat(match[1].replace(/,/g, '')) : null;
  }

  extractVolume(text) {
    const volumeMatch = text.match(/Volume.*?([0-9,]+\.?[0-9]*)\s*([BMK]?)/i);
    if (!volumeMatch) return null;
    
    const value = parseFloat(volumeMatch[1].replace(/,/g, ''));
    const unit = volumeMatch[2].toUpperCase();
    
    switch(unit) {
      case 'B': return value * 1e9;
      case 'M': return value * 1e6;
      case 'K': return value * 1e3;
      default: return value;
    }
  }

  extractRecommendation(text) {
    // Version française en priorité
    if (text.includes('ACHAT FORT')) return 'ACHAT FORT';
    if (text.includes('ACHAT')) return 'ACHAT';
    if (text.includes('CONSERVER')) return 'CONSERVER';
    if (text.includes('VENDRE')) return 'VENDRE';
    if (text.includes('VENTE FORTE')) return 'VENTE FORTE';
    
    // Fallback anglais si pas trouvé en français
    if (text.includes('STRONG BUY') || text.includes('Strong BUY')) return 'ACHAT FORT';
    if (text.includes('BUY')) return 'ACHAT';
    if (text.includes('HOLD')) return 'CONSERVER';
    if (text.includes('SELL')) return 'VENDRE';
    
    return 'CONSERVER';
  }

  generateDemoAnalysis() {
    return `**Mode Démo - Serveur MCP Indisponible**
    
**Prix:** Données de démonstration
**Analyse:** Serveur MCP temporairement indisponible
**Recommandation:** Veuillez réessayer dans quelques instants`;
  }

  generateDemoData(symbol) {
    return {
      success: true,
      symbol: symbol,
      analysis: {
        price: 100 + Math.random() * 50,
        change_24h: (Math.random() - 0.5) * 5,
        volume: 1000000,
        technical_indicators: {
          rsi: 30 + Math.random() * 40,
          trend: 'neutral',
          recommendation: 'CONSERVER'
        },
        recommendation: 'CONSERVER',
        confidence_score: 0.5
      },
      source: 'demo_fallback'
    };
  }
}

const mcpService = new MCPService();
export default mcpService;