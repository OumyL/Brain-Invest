#!/bin/bash
echo "🚀 Démarrage Brain Invest Platform..."

# Démarrer le serveur MCP
echo "🔸 Démarrage serveur MCP..."
cd server
python -m mcp_trader.server &
cd ..

# Démarrer le backend
echo "🔸 Démarrage backend..."
cd client/server
npm start &
cd ../..

# Démarrer le frontend
echo "🔸 Démarrage frontend..."
cd client
npm start &
cd ..

echo "✅ Tous les services démarrés!"
echo "🌐 Frontend: http://localhost:3000"
echo "🌐 Backend: http://localhost:3001"
echo "⏹️  Ctrl+C pour arrêter tous les services"

wait