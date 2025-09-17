// server/mcp-bridge.js
const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

class MCPBridge {
  constructor() {
    this.mcpProcess = null;
    this.requestQueue = new Map();
    this.requestId = 0;
    this.isReady = false;
    this.isInitialized = false;
    this.handshakeAttempted = false;
    this.initializeMCP();
  }

  initializeMCP() {
    const mcpPath = path.join(__dirname, '../../mcp-trader');
    
    console.log('Starting MCP Python server from:', mcpPath);
    
    this.mcpProcess = spawn('uv', ['run', 'mcp-trader'], {
      cwd: mcpPath,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.mcpProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('MCP stdout:', output);
      this.handleMCPResponse(output);
    });

    this.mcpProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.log('MCP stderr:', error);
      
      // DÃ©tecter quand le serveur est prÃªt pour l'initialisation
      if (error.includes('Server ready!') && !this.handshakeAttempted) {
        this.handshakeAttempted = true;
        console.log('MCP Python server ready, performing handshake...');
        setTimeout(() => {
          this.performHandshake();
        }, 3000); // Attendre 3 secondes
      }
    });

    this.mcpProcess.on('error', (error) => {
      console.error('MCP Process error:', error);
    });

    this.mcpProcess.on('close', (code) => {
      console.log('MCP Process closed with code:', code);
      this.isReady = false;
      this.isInitialized = false;
    });

    console.log('MCP Bridge: Python server connecting via stdio...');
  }

  async performHandshake() {
    try {
      console.log('Starting MCP initialization handshake...');
      
      // Ã‰tape 1: Initialize
      await this.initializeHandshake();
      console.log('MCP initialization completed');
      
      // Attendre un peu avant la notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ã‰tape 2: Initialized notification
      await this.sendInitializedNotification();
      console.log('MCP initialized notification sent');
      
      this.isInitialized = true;
      this.isReady = true;
      console.log('ðŸŽ‰ MCP handshake completed successfully - ready for tool calls');
      
    } catch (error) {
      console.error('âŒ MCP handshake failed:', error);
      this.isReady = false;
    }
  }

  async initializeHandshake() {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      
      const initRequest = {
        jsonrpc: "2.0",
        id: id,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          clientInfo: {
            name: "mcp-bridge",
            version: "1.0.0"
          }
        }
      };

      console.log('Sending initialization request...');
      this.requestQueue.set(id, { resolve, reject });
      this.mcpProcess.stdin.write(JSON.stringify(initRequest) + '\n');

      setTimeout(() => {
        if (this.requestQueue.has(id)) {
          this.requestQueue.delete(id);
          reject(new Error('Initialization timeout'));
        }
      }, 15000);
    });
  }

  async sendInitializedNotification() {
    return new Promise((resolve) => {
      const notification = {
        jsonrpc: "2.0",
        method: "notifications/initialized",
        params: {}
      };

      console.log('Sending initialized notification...');
      this.mcpProcess.stdin.write(JSON.stringify(notification) + '\n');
      
      // Les notifications n'attendent pas de rÃ©ponse
      setTimeout(resolve, 1000);
    });
  }

  handleMCPResponse(data) {
    try {
      const lines = data.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          console.log('Parsed MCP response:', response);
          
          if (response.id && this.requestQueue.has(response.id)) {
            const { resolve } = this.requestQueue.get(response.id);
            this.requestQueue.delete(response.id);
            resolve(response);
          }
        } catch (parseError) {
          console.log('Non-JSON line:', line.substring(0, 100));
        }
      }
    } catch (error) {
      console.error('Error processing MCP response:', error);
    }
  }

  async callMCPTool(toolName, args) {
    if (!this.isReady || !this.isInitialized) {
      throw new Error(`MCP server not ready (ready: ${this.isReady}, initialized: ${this.isInitialized})`);
    }

    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      
      const request = {
        jsonrpc: "2.0",
        id: id,
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args || {}
        }
      };

      console.log(`Calling MCP tool: ${toolName}`);
      this.requestQueue.set(id, { resolve, reject });

      try {
        this.mcpProcess.stdin.write(JSON.stringify(request) + '\n');
      } catch (error) {
        this.requestQueue.delete(id);
        reject(error);
        return;
      }

      const timeout = setTimeout(() => {
        if (this.requestQueue.has(id)) {
          this.requestQueue.delete(id);
          reject(new Error(`Timeout for tool: ${toolName}`));
        }
      }, 30000);

      const originalResolve = this.requestQueue.get(id).resolve;
      this.requestQueue.set(id, {
        resolve: (result) => {
          clearTimeout(timeout);
          originalResolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      });
    });
  }
}

const mcpBridge = new MCPBridge();

// Route principale pour appeler les outils MCP avec extraction de contenu corrigÃ©e
app.post('/mcp/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    
    if (!name) {
      return res.status(400).json({
        error: 'Missing tool name',
        message: 'Request must include a "name" field'
      });
    }

    if (!mcpBridge.isReady || !mcpBridge.isInitialized) {
      return res.status(503).json({
        error: 'MCP server not ready',
        message: 'Python MCP server is still initializing',
        ready: mcpBridge.isReady,
        initialized: mcpBridge.isInitialized
      });
    }

    console.log(`\n=== MCP Tool Call: ${name} ===`);
    console.log('Arguments:', args);
    
    const result = await mcpBridge.callMCPTool(name, args);
    
    if (result.error) {
      console.error('MCP tool error:', result.error);
      res.status(500).json({
        error: result.error.message || 'MCP tool execution failed',
        code: result.error.code || -1,
        data: result.error.data
      });
    } else {
      // Extraire le contenu text de la structure MCP
      let content = result.result;
      
      if (content && content.content && Array.isArray(content.content)) {
        // Structure FastMCP avec content array
        content = content.content
          .filter(item => item.type === 'text')
          .map(item => item.text)
          .join('\n');
      } else if (typeof content === 'string') {
        // Contenu direct
        content = content;
      } else {
        // Fallback vers JSON
        content = JSON.stringify(content, null, 2);
      }
      
      console.log('Extracted content preview:', content.substring(0, 200) + '...');
      
      res.json({
        content: content,
        source: 'mcp_python_server',
        timestamp: new Date().toISOString(),
        success: true
      });
    }
  } catch (error) {
    console.error('Bridge error:', error);
    res.status(500).json({
      error: error.message,
      message: 'Internal bridge error',
      fallback: true
    });
  }
});

// Route de test
app.get('/test', async (req, res) => {
  try {
    if (!mcpBridge.isReady || !mcpBridge.isInitialized) {
      return res.status(503).json({
        test: 'not_ready',
        ready: mcpBridge.isReady,
        initialized: mcpBridge.isInitialized,
        message: 'MCP server not ready yet'
      });
    }

    console.log('=== Testing system_diagnostic ===');
    const result = await mcpBridge.callMCPTool('system_diagnostic', {});
    
    // Extraire le contenu pour le test
    let content = result.result;
    if (content && content.content && Array.isArray(content.content)) {
      content = content.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
    }
    
    res.json({
      test: 'success',
      result: result,
      extracted_content: content
    });
  } catch (error) {
    console.error('Test failed:', error);
    res.status(500).json({
      test: 'failed',
      error: error.message,
      ready: mcpBridge.isReady,
      initialized: mcpBridge.isInitialized
    });
  }
});

// Route de test AAPL
app.get('/test-aapl', async (req, res) => {
  try {
    if (!mcpBridge.isReady || !mcpBridge.isInitialized) {
      return res.status(503).json({
        test: 'not_ready',
        message: 'MCP server not ready yet'
      });
    }

    console.log('=== Testing analyze_stock AAPL ===');
    const result = await mcpBridge.callMCPTool('analyze_stock', { symbol: 'AAPL' });
    
    // Extraire le contenu
    let content = result.result;
    if (content && content.content && Array.isArray(content.content)) {
      content = content.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
    }
    
    res.json({
      test: 'success',
      symbol: 'AAPL',
      result: result,
      extracted_content: content.substring(0, 500) + '...'
    });
  } catch (error) {
    console.error('AAPL test failed:', error);
    res.status(500).json({
      test: 'failed',
      error: error.message
    });
  }
});

// Route de santÃ©
app.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    mcp_bridge: 'connected',
    python_server: mcpBridge.isReady ? 'active' : 'starting',
    initialized: mcpBridge.isInitialized,
    timestamp: new Date().toISOString()
  });
});

// Gestion propre de l'arrÃªt
process.on('SIGINT', () => {
  console.log('Shutting down MCP bridge...');
  if (mcpBridge.mcpProcess) {
    mcpBridge.mcpProcess.kill();
  }
  process.exit(0);
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`\nðŸŒ‰ MCP Bridge HTTP server running on port ${PORT}`);
  console.log(`ðŸ“‹ Health check: http://localhost:${PORT}/health`);
  console.log(`ðŸ§ª Test diagnostic: http://localhost:${PORT}/test`);
  console.log(`ðŸ“Š Test AAPL: http://localhost:${PORT}/test-aapl`);
  console.log(`\nWaiting for MCP Python server initialization...\n`);
});