# MCP Trader Enhanced 🚀
Un serveur MCP (Model Context Protocol) avancé pour l'analyse financière complète, offrant des outils d'analyse technique, fondamentale, et de sentiment pour les actions et cryptomonnaies.
## 🌟 Fonctionnalités Principales

📈 Analyse Technique

* Indicateurs avancés : RSI, MACD, Bollinger Bands, Stochastique, Williams %R, CCI, MFI, VWAP
* Moyennes mobiles : SMA 20/50/200 avec analyse de tendance
* Détection de patterns : Double top/bottom, triangles, breakouts, support/résistance
* Analyse de volume : Profile de volume, ratios de volume, anomalies
* Force relative : Comparaison vs benchmarks (SPY, etc.)

💼 Analyse Fondamentale

* Données d'entreprise : Vue d'ensemble complète, secteur, industrie
* Ratios financiers : P/E, P/B, ROE, ROA, marges, endettement
* Analyse des résultats : Surprises d'EPS, tendances trimestrielles
* Thèse d'investissement : Recommandations basées sur les fondamentaux
* Comparaison d'entreprises : Analyse comparative multi-critères

📰 Analyse de Sentiment

* Actualités financières : Analyse automatique des news
* Sentiment NLP : TextBlob et VADER pour analyse avancée
* Tendances temporelles : Évolution du sentiment dans le temps
* Thèmes clés : Extraction automatique des sujets importants

⚖️ Gestion des Risques

* Calcul de position : Taille optimale basée sur le risque
* Suggestions de stop-loss : ATR, pourcentages, niveaux techniques
* Évaluation du risque : Volatilité, ratios, analyse de corrélation

🔍 Screening Avancé

* Filtres personnalisés : Critères techniques et fondamentaux
* Screeners prédéfinis : Momentum, survente, consolidation
* Classement intelligent : Score composite multi-facteurs

🤖 Intelligence Artificielle

* Prédiction de prix : Modèles ML (Random Forest, XGBoost, Ensemble)
* Analyse prédictive : Horizons multiples (1j, 7j, 30j, 90j)
* Feature engineering : 50+ indicateurs techniques automatiques
  
🔧 Installation

**Prérequis**
  
* Python 3.11+
* Clés API (détails ci-dessous)
**Installation rapide**
  
```bash
 # Cloner le repository
 git clone https://github.com/OumyL/mcp2.git
cd mcp2
# Installer avec uv (recommandé)
uv sync

# Ou avec pip
pip install -r requirements.txt
```
**Configuration des variables d'environnement**

  ```Créez un fichier .env à la racine du projet :```
  
```bash
# 🔑 CLÉS API REQUISES

# Tiingo (OBLIGATOIRE) - Données actions/crypto
TIINGO_API_KEY=your_tiingo_api_key_here

# Alpha Vantage (OPTIONNEL) - Analyse fondamentale
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# NewsAPI (OPTIONNEL) - Analyse de sentiment
NEWS_API_KEY=your_news_api_key_here

# 🛠️ CONFIGURATION SERVEUR
MCP_SERVER_NAME=mcp-trader-enhanced
LOG_LEVEL=INFO

# ⚖️ GESTION DES RISQUES
DEFAULT_MAX_RISK_PERCENT=2.0
BACKTEST_INITIAL_CAPITAL=100000.0
BACKTEST_COMMISSION=0.001

# 🎛️ FONCTIONNALITÉS
ENABLE_FUNDAMENTAL_ANALYSIS=true
ENABLE_SENTIMENT_ANALYSIS=true
ENABLE_PATTERN_RECOGNITION=true
ENABLE_BACKTESTING=true
```

**Obtenir les clés API**

* Tiingo (OBLIGATOIRE - Gratuit)
  
1. Inscrivez-vous sur tiingo.com
2. Confirmez votre email
3. Récupérez votre token API
4. Limite : 500 requêtes/jour (gratuit), 50,000/jour (payant)
   
* Alpha Vantage (OPTIONNEL - Gratuit)

1. Inscrivez-vous sur alphavantage.co
2. Récupérez votre clé API gratuite
3. Limite : 500 requêtes/jour (gratuit)

* NewsAPI (OPTIONNEL - Gratuit)

1. Inscrivez-vous sur newsapi.org
2. Récupérez votre clé API
3. Limite : 100 requêtes/jour (gratuit)
   
## 🚀 Démarrage

**Lancement du serveur**

```bash
# Avec uv (recommandé)
uv run mcp-trader

# Ou directement
python -m mcp_trader.server
```
**Vérification du statut**

```bash 
# Test rapide des APIs
system_diagnostic()

# Vérification spécifique
api_status_check()
```
## 🔍 Fonctionnalités Avancées

**Fallback Automatique**

Le système intègre un fallback intelligent :

* Tiingo → Binance (crypto)
* Tiingo → yfinance (actions)
* Gestion automatique des limites API
📊 Exemples de Sorties

**Analyse Technique**

  ```bash
**Stock Analysis: AAPL**

🚀 **Overall Signal: Strong BUY**
**Signal Strength: 85/100**

**Trend Analysis:**
- Above 20 SMA: ✅
- Above 50 SMA: ✅  
- Above 200 SMA: ✅

**Momentum:**
- RSI (14): 65.4
- MACD: ✅ Bullish

**Key Metrics:**
- Latest Price: $185.50
- ATR (14): $3.25
- Volume Avg (20D): 52,450,000
  ```
**Analyse Fondamentale**

  ```bash
**Investment Thesis: AAPL**

🚀 **Final Recommendation: STRONG BUY**
🎯 **Confidence Level: High**
**Combined Score: 87.5/100**

**Investment Strengths:**
- Excellent return on equity (28.5%)
- Strong profit margins (23.1%)
- Conservative debt levels
  ```
## 🛠️ Architecture Technique

**Structure de Code**

  ```bash
mcp_trader/
├── server.py          # Serveur MCP principal
├── data.py            # Récupération de données
├── indicators.py      # Analyse technique  
├── fundamental.py     # Analyse fondamentale
├── news_sentiment.py  # Analyse de sentiment
├── screening.py       # Screening avancé
├── backtesting.py     # Backtesting
├── config.py          # Configuration
└── models.py          # Modèles Pydantic
  ```
 **APIs Supportées**

* Tiingo : Actions, crypto, données historiques
* Binance : Crypto (fallback)
* Alpha Vantage : Fondamentaux, financiers
* NewsAPI : Actualités, sentiment

## 🔒 Limitations et Quotas

**Quotas API (Gratuits)**

* Tiingo : 500 requêtes/jour
* Alpha Vantage : 500 requêtes/jour
* NewsAPI : 100 requêtes/jour

**Recommandations d'Usage**

* Utilisez le cache intelligent intégré
* Respectez les délais entre requêtes
* Priorisez les analyses groupées
* Surveillez les logs pour les limites
  
## 📄 Licence

Distribué sous licence MIT. Voir LICENSE pour plus d'informations.

## 👤 Auteur

**Oumaima Tayabi**

* Email: tayabi.ouma@gmail.com
* GitHub: @oumyL

## ⚠️ Disclaimer

Ce projet est à des fins éducatives et de recherche. Les analyses et recommandations générées ne constituent pas des conseils financiers. Consultez toujours un conseiller financier qualifié avant de prendre des décisions d'investissement.
