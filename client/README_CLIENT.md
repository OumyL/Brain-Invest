# 🧠 Brain Invest - Assistant Trading IA

**Brain Invest** est une plateforme intelligente d'assistance au trading qui combine l'intelligence artificielle avec des outils d'analyse financière avancés pour aider les traders et investisseurs à prendre des décisions éclairées.

![Brain Invest](./public/images/B-dark.png)

## 🚀 Fonctionnalités Principales

📊 Analyses en Temps Réel

* Analyse technique automatisée des actions et crypto-monnaies
* Graphiques TradingView intégrés avec thème automatique
* Indicateurs techniques : RSI, MACD, Bollinger Bands
* Niveaux de support/résistance calculés dynamiquement
* Recommandations d'achat/vente basées sur l'IA
* Panneau d'analyse redimensionnable avec splitter intelligent

🤖 Assistant IA Conversationnel

* Interface chat intuitive avec design noir/vert premium
* Suggestions rapides pour analyses populaires (BTC, AAPL, TSLA, etc.)
* Historique des conversations sauvegardé et synchronisé
* Réponses contextuelles avec formatage markdown
* Détection automatique des symboles financiers
* Mode trading avec panneau d'analyse automatique

📈 Outils de Trading Avancés

* Service MCP intégré pour analyses temps réel
* Calculateur de position pour la gestion du risque
* Analyse de sentiment du marché
* Détection de patterns graphiques automatique
* Profil de volume par prix
* Interface split-view redimensionnable
* Synchronisation thème avec TradingView

🔐 Système d'Authentification Complet

* Inscription/Connexion avec JWT sécurisé
* Gestion des rôles (utilisateur/administrateur)
* Interface admin complète avec statistiques
* Dashboard administrateur avec contrôles système
* Gestion utilisateurs (création, suppression, monitoring)
* Thème sombre/clair avec synchronisation automatique

🎨 Interface Utilisateur Premium

* Design moderne avec palette noir/vert
* Logos adaptatifs selon le thème
* Animations fluides et micro-interactions
* Sidebar rétractable avec navigation intelligente
* Mode responsive pour tous les écrans
* Composants debug pour développement

🛠 Architecture Technique
* Frontend (React.js) - Architecture Avancée
```bash src/
├── components/
│   ├── auth/           # Authentification complète
│   │   ├── AuthPage.jsx          # Page connexion avec thème adaptatif
│   │   ├── AuthModal.jsx         # Modal auth pour composants
│   │   ├── AuthGuard.jsx         # Protection de routes
│   │   └── LoginScreen.jsx       # Écran de connexion legacy
│   ├── chat/           # Interface conversationnelle
│   │   ├── ChatMessages.jsx      # Affichage des messages
│   │   ├── MessageBubble.jsx     # Bulles de message avec markdown
│   │   ├── MessageInput.jsx      # Zone de saisie avancée
│   │   └── ThinkingIndicator.jsx # Animation réflexion IA
│   ├── layout/         # Structure de l'interface
│   │   ├── Layout.jsx            # Layout principal avec thème noir/vert
│   │   ├── ChatContainer.jsx     # Conteneur de chat avec styles forcés
│   │   └── ResizableChatContainer.jsx # Vue redimensionnable avec splitter
│   ├── sidebar/        # Barre latérale intelligente
│   │   ├── ConversationItem.jsx  # Éléments avec édition inline
│   │   ├── ConversationItemMinimal.jsx # Version minimale
│   │   ├── DeleteConversationButton.jsx # Suppression sécurisée
│   │   ├── MinimalSidebar.jsx    # Sidebar compacte projets
│   │   └── NewChatButton.jsx     # Bouton nouvelle conversation
│   ├── trading/        # Outils de trading avancés
│   │   ├── AnalysisPanel.jsx     # Panneau d'analyse synchronisé
│   │   └── TradingViewChart.jsx  # Graphiques avec thème automatique
│   ├── admin/          # Interface administrateur complète
│   │   ├── AdminDashboard.jsx    # Dashboard avec onglets
│   │   └── VersionControl.jsx    # Contrôle version et backup
│   ├── profile/        # Gestion profil utilisateur
│   │   ├── ProfileModal.jsx      # Modal profil avec onglets
│   │   └── DocumentManager.jsx   # Upload et gestion documents
│   ├── ui/             # Composants UI réutilisables
│   │   ├── Avatar.jsx            # Avatars adaptatifs utilisateur/bot
│   │   ├── Button.jsx            # Boutons avec variants
│   │   ├── LoadingScreen.jsx     # Écran de chargement
│   │   ├── ModelDropdown.jsx     # Sélection modèles IA (legacy)
│   │   ├── ModelSelector.jsx     # Sélecteur modèles avancé
│   │   ├── ThemeToggle.jsx       # Commutateur thème animé
│   │   └── ApiKeyMessage.jsx     # Message configuration APIs
│   ├── debug/          # Outils de développement
│   │   └── ConversationDebug.jsx # Debug conversations en dev
│   ├── AuthWrapper.jsx           # Wrapper authentification
│   └── ErrorBoundary.jsx         # Gestion erreurs React
├── context/            # Gestion d'état React Context
│   ├── ChatContext.jsx           # État conversations avec isolation utilisateur
│   ├── UserContext.jsx           # Gestion utilisateurs et profils
│   ├── ThemeContext.jsx          # Thème global synchronisé
│   ├── ProjectContext.jsx        # Projets et navigation
│   └── MCPContext.jsx            # Intégration services MCP
├── hooks/              # Hooks personnalisés avancés
│   ├── useChatInteraction.js     # Interactions chat optimisées
│   └── useSymbolDetection.js     # Détection symboles financiers temps réel
├── services/           # Services API et intégrations
│   ├── mcpService.js             # Communication avec MCP Bridge
│   ├── llmService.js             # Intégration modèles IA
│   └── detailedResponseService.js # Génération réponses détaillées
└── utils/              # Utilitaires et helpers
    ├── authManager.js            # Gestionnaire authentification JWT
    ├── versionControl.js         # Système de versioning
    ├── imageUtils.js             # Compression et optimisation images
    └── logger.js                 # Système de logging avancé
```
* Backend (Node.js + Express)
```bash
server/
├── config/             # Configuration base de données
├── models/             # Modèles MongoDB
├── mcp-bridge.js       # Pont vers services MCP
└── server.js           # Serveur principal
```
* Services MCP (Python)

Serveur d'analyse financière externe
APIs de données en temps réel
Calculs techniques avancés
## 🔧 Installation et Configuration

**Prérequis Techniques**

* Node.js 18+ et npm
* MongoDB 6+ (local ou cloud Atlas)
* Python 3.8+ (pour serveur MCP)
* Git pour clonage et versioning

1. Clonage et Installation
```bash
bash# Cloner le repository
git clone https://github.com/OumyL/TestFront.git
cd TestFront

# Installation dépendances principales
```bash npm install```

# Installation dépendances serveur
cd server && npm install && cd ..
```
2. Configuration Environment
```Créer .env dans server/ :```
```bash
env# Base de données
MONGODB_URI=mongodb://localhost:27017/brain-invest
# ou MongoDB Atlas :
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brain-invest

# Authentification
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Configuration serveur
SERVER_PORT=3001
NODE_ENV=production

# APIs optionnelles (pour extensions futures)
TIINGO_API_KEY=your_tiingo_key
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
```
3. Démarrage des Services
Option A: Développement (services séparés)
```bash
bash# Terminal 1: Backend + Base de données
npm run server

# Terminal 2: Bridge MCP (si disponible)  
npm run mcp-bridge

# Terminal 3: Frontend React
npm start

# Démarrage complet avec concurrently
npm run dev
```
4. Configuration MongoDB
```
bash# Installation MongoDB locale (Ubuntu/Debian)
sudo apt-get install -y mongodb

# Démarrage service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Vérification
mongo --eval "db.adminCommand('listCollections')"
```
## 📱 Utilisation

### 🔑 Connexion
1. **Compte Admin par défaut** :
   - Email : `admin@braininvest.com`
   - Mot de passe : `admin123`

2. **Inscription utilisateur** : Interface d'inscription disponible

💬 Interface Chat

* Mode Général : Chat simple avec sidebar visible
* Mode Trading : Interface split-view avec panneau d'analyse
* Suggestions rapides : Boutons pour analyses courantes
* Commandes naturelles : "Analyse BTC", "Comment va AAPL ?", etc.
* Thème adaptatif : Synchronisation automatique clair/sombre
* Historique persistant : Conversations sauvegardées par utilisateur

📊 Analyses Disponibles

* Actions : AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA, META, etc.
* Crypto : BTC, ETH, ADA, SOL, MATIC, AVAX, etc.
* Indicateurs : RSI, MACD, supports/résistances, volume
* Graphiques TradingView : Intégration complète avec thème automatique
* Panneau redimensionnable : Ajustement manuel de la taille des vues

🎨 Interface Utilisateur

* Design premium avec palette noir (#000000) et vert (#0d9488)
* Logos adaptatifs selon le thème (B-light.png / B-dark.png)
* Interface responsive avec breakpoints mobile/desktop
* Sidebar intelligente avec modes rétractable/fixe
* Vue split redimensionnable pour le mode trading
* Thème synchronisé avec TradingView et tous les composants
* Debug tools intégrés pour le développement

🔐 Sécurité

* JWT Authentication avec refresh automatique
* Hashage bcrypt des mots de passe
* Validation stricte côté client et serveur
* Isolation utilisateurs (conversations et données privées)
* Protection CSRF et validation des tokens
* Headers sécurisés et CORS configuré
* Logs d'activité avec système de surveillance

📈 API Endpoints
**Authentification**

* POST /api/auth/login - Connexion utilisateur
* POST /api/auth/register - Inscription nouvelle
* GET /api/auth/verify - Vérification token JWT

**Conversations**

* GET /api/conversations - Liste des conversations utilisateur
* POST /api/conversations - Créer nouvelle conversation
* PUT /api/conversations/:id - Modifier conversation existante
* DELETE /api/conversations/:id - Supprimer conversation

**Administration**

* GET /api/admin/users - Liste complète des utilisateurs
* GET /api/admin/stats - Statistiques détaillées
* DELETE /api/admin/users/:id - Supprimer utilisateur
* POST /api/admin/cleanup-conversations - Nettoyage base données
* GET /api/admin/conversation-stats - Statistiques conversations

**Analyses Trading**

* POST /api/mcp/analyze - Analyser un symbole financier
* POST /mcp/tools/call - Appel direct aux outils MCP (Bridge)
* GET /test - Test diagnostic système MCP
* GET /test-aapl - Test analyse AAPL
* GET /health - Vérification santé système

**🛡 Administration**
* Dashboard Admin

* Vue d'ensemble : statistiques utilisateurs
* Gestion utilisateurs : ajout/suppression
* Configuration système : paramètres MCP
* Monitoring : état des services

**Fonctionnalités Admin**

* Nettoyage des conversations orphelines
* Export des logs système
* Gestion des backups
* Configuration des APIs

🔮 Fonctionnalités Avancées
**Contrôle de Version**

* Système de backup automatique
* Restauration de versions
* Export des logs d'activité

**Gestion Utilisateurs**

* Rôles multiples (admin/utilisateur)
* Préférences personnalisées
* Portfolio de trading (en développement)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

- **Documentation** : Consultez ce README
---

**Brain Invest** - *Votre assistant personnel pour des décisions de trading intelligentes* 🧠📈
