#!/bin/bash
echo "🚀 Installation de Brain Invest Platform..."

echo "📦 Installation dépendances client..."
cd client
npm install
cd server && npm install && cd ../..

echo "📦 Installation dépendances serveur MCP..."
cd server
pip install -r requirements.txt
cd ..

echo "✅ Installation terminée!"
echo "📝 N'oubliez pas de configurer vos .env files"