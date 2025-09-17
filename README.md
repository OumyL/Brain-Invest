# Brain Invest Platform 🧠📈

**Plateforme d'Intelligence Artificielle pour le Trading et l'Analyse Financière**

Une solution complète combinant un serveur d'analyse financière avancé (MCP) avec une interface web moderne pour des décisions de trading éclairées.

## 🎯 Vue d'Ensemble
Brain Invest Platform est une plateforme complète qui combine :

**🖥️ Frontend Intelligent (/client)**

* Interface web moderne avec React.js et design premium noir/vert
* Assistant IA conversationnel pour analyses financières en temps réel
* Graphiques TradingView intégrés avec synchronisation de thème
* Système d'authentification JWT sécurisé avec rôles utilisateur/admin
* Dashboard administrateur avec statistiques et gestion utilisateurs

**⚙️ Serveur MCP Avancé (/server)**

* Serveur d'analyse financière basé sur le Model Context Protocol
* Analyse Technique : RSI, MACD, Bollinger Bands, moyennes mobiles, détection de patterns
* Analyse Fondamentale : P/E, ROE, marges, ratios financiers, thèses d'investissement
* Analyse de Sentiment : NLP des actualités financières avec TextBlob et VADER
* Gestion de Risque : Calcul de positions, stop-loss, évaluation de volatilité

## 🚀 Installation Rapide

**Prérequis**

* Node.js 18+ et npm
* Python 3.11+
* MongoDB 6+ (local ou cloud)
* Git
  
**Installation en Une Commande**
```bash
# 1. Cloner le projet
git clone https://github.com/VotreUsername/brain-invest-platform.git
cd brain-invest-platform

# 2. Installation des dépendances client
cd client
npm install

# 3. Installation des dépendances serveur MCP
cd ../server
uv sync
```

**C'est tout ! 🎉** Votre application sera disponible sur :

* Frontend : http://localhost:3000

* Backend : http://localhost:3001

## 🔧 Configuration Manuelle (Optionnel)
Si vous préférez configurer manuellement 

**1. Installation des Dépendances**
```bash
# Frontend et Backend Node.js
cd client
npm install
# Serveur MCP Python
cd ../server
uv sync
# Ou avec pip : pip install -r requirements.txt
```
**2. Variables d'Environnement**

``Client (créer client/.env.local) :``

```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_MCP_BRIDGE_URL=http://localhost:3002
```

``Client (créer client/server/.env) :``

```bash
MONGODB_URI=mongodb://localhost:27017/brain-invest
JWT_SECRET=votre_secret_jwt_ultra_securise
SERVER_PORT=3001
NODE_ENV=development
```
``Serveur MCP (créer server/.env) :``
```bash
# API Obligatoire
TIINGO_API_KEY=your_tiingo_api_key_here

# APIs Optionnelles
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
NEWS_API_KEY=your_news_api_key_here

# Configuration
MCP_SERVER_NAME=mcp-trader-enhanced
LOG_LEVEL=INFO
DEFAULT_MAX_RISK_PERCENT=2.0
```
**3. Démarrage Manuel**
```bash
# Terminal 1: Serveur MCP Python
cd server
uv run mcp-trader

# Terminal 2: MCP Bridge
cd client
npm run mcp-bridge

# Terminal 3: Backend Node.js  
cd client
npm run server

# Terminal 4: Frontend React
cd client
npm start
```
## 🔑 Configuration des APIs

🎯 API Obligatoire

**Tiingo (Gratuit - 500 requêtes/jour)**
1. Inscription sur tiingo.com
2. Récupérez votre API key
3. Ajoutez dans server/.env : TIINGO_API_KEY=votre_key

🔧 APIs Optionnelles

**Alpha Vantage - Analyses fondamentales (Gratuit - 500 req/jour)**
* Inscription : alphavantage.co

**NewsAPI - Sentiment des actualités (Gratuit - 100 req/jour)**

* Inscription : newsapi.org

## 💬 Assistant IA Conversationnel

```bash
👤 "Comment va Bitcoin aujourd'hui ?"
🤖 Analyse complète : prix, tendance, RSI, volume, sentiment...

👤 "Recommandations pour AAPL ?"  
🤖 Signal d'achat/vente avec justification technique et fondamentale

👤 "Screening actions momentum"
🤖 Liste des actions avec fort momentum, critères techniques
```
## 🛡️ Sécurité et Administration

* Authentification JWT sécurisée avec refresh tokens
* Rôles utilisateur : Utilisateur standard / Administrateur
* Dashboard admin : Statistiques, gestion utilisateurs, monitoring
* Isolation des données : Chaque utilisateur a ses conversations privées
  
## 🏗️ Architecture du Projet

```bash
brain-invest-platform/
│
├── 📱 client/                    # Frontend React + Backend Node.js + MCP Bridge
│   ├── src/
│   │   ├── components/          # Composants React
│   │   │   ├── auth/           # Authentification
│   │   │   ├── chat/           # Interface conversationnelle  
│   │   │   ├── trading/        # Outils de trading
│   │   │   ├── admin/          # Interface administrateur
│   │   │   └── ui/             # Composants réutilisables
│   │   ├── context/            # Gestion d'état React
│   │   ├── hooks/              # Hooks personnalisés
│   │   └── services/           # Services API
│   ├── server/                 # Backend Express.js
│   │   ├── models/             # Modèles MongoDB
│   │   ├── mcp-bridge.js       # Pont vers serveur MCP
│   │   └── server.js           # Serveur principal
│   ├── package.json            # Scripts npm (mcp-bridge, server, start)
│   └── README_CLIENT.md
│
├── 🐍 server/                   # Serveur MCP Python
│   └── mcp_trader/
│       ├── server.py           # Serveur MCP principal
│       ├── data.py             # Récupération de données
│       ├── indicators.py       # Analyse technique
│       ├── fundamental.py      # Analyse fondamentale
│       ├── news_sentiment.py   # Analyse sentiment
│       └── screening.py        # Screening avancé
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── README_SERVER.md
│
└── 📚 docs/                   # Documentation
    ├── api-reference.md
    └── troubleshooting.md
```

## 🎮 Utilisation

**Interface Chat - Exemples de Commandes**
```bash
# Analyses rapides
"Analyse BTC"
"AAPL buy or sell?"  
"Comment va TSLA ?"

# Analyses détaillées
"Analyse technique complète NVDA"
"Fondamentaux MSFT vs GOOGL"
"Sentiment du marché crypto"

# Gestion de risque
"Position sizing AAPL pour 10k$"
"Stop loss suggestions TSLA"
"Volatilité BTC vs ETH"
```
## Comptes par Défaut

**Administrateur :**

* Email : admin@braininvest.com
* Mot de passe : admin123
  
## 🔍 APIs et Endpoints

**Authentification**
* POST /api/auth/login - Connexion utilisateur
* POST /api/auth/register - Inscription
* GET /api/auth/verify - Vérification token
  
**Analyses Trading**
* POST /api/mcp/analyze - Analyser un symbole financier
* POST /mcp/tools/call - Appel direct aux outils MCP
* GET /test-aapl - Test analyse AAPL
  
**Administration**
* GET /api/admin/users - Liste des utilisateurs
* GET /api/admin/stats - Statistiques plateforme
* DELETE /api/admin/users/:id - Supprimer utilisateur
* 
## 📄 Licence

Distribué sous licence MIT. Voir LICENSE pour plus d'informations.

## 👨‍💻 Auteur

**Oumaima Tayabi**

* 📧 Email : tayabi.ouma@gmail.com
* 🐙 GitHub : @OumyL
* 💼 LinkedIn : Oumaima Tayabi

## ⚠️ Avertissement Légal

Ce projet est conçu à des fins éducatives et de recherche. Les analyses et recommandations générées par l'IA ne constituent pas des conseils financiers professionnels.

**⚠️ Important :** Consultez toujours un conseiller financier qualifié avant de prendre des décisions d'investissement. Les marchés financiers comportent des risques de perte en capital.

<div align="center">
**🧠 Brain Invest Platform - L'Intelligence Artificielle au Service de Vos Investissements 📈**
Développé avec ❤️ pour la communauté des traders et investisseurs
  
![Brain Invest](client/public/images/B-dark.png)
</div>
