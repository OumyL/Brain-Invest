const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/database');
const User = require('./models/User');
const Conversation = require('./models/Conversation');

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Connecter à MongoDB
connectDB();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'brain_invest_secret_key_2025';

// Utilisateurs en mémoire (incluant l'admin par défaut)
let users = [
  {
    id: 1,
    email: 'admin@braininvest.com',
    password: '$2b$10$G1H9bLouCuyB6ZqDYWyCVORVicBbyYU/Bxz7fejvvNsf/joys8hdC', // admin123
    firstName: 'Admin',
    lastName: 'Brain Invest',
    role: 'admin',
    company: 'Brain Invest',
    createdAt: new Date().toISOString()
  }
];

// MIDDLEWARES D'AUTHENTIFICATION
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token d\'accès requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès administrateur requis' });
  }
  next();
};

// ROUTES D'AUTHENTIFICATION

// Route d'inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, company } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà' });
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      company: company || '',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retourner les données utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: userWithoutPassword
    });

    console.log(`✅ New user registered: ${email}`);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retourner les données utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Connexion réussie',
      token,
      user: userWithoutPassword
    });

    console.log(`✅ User logged in: ${email} (${user.role})`);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// Route de vérification du token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// ROUTES ADMIN

// Route admin - Liste des utilisateurs
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  
  res.json({
    users: usersWithoutPasswords,
    total: users.length
  });
});

// Route admin - Supprimer un utilisateur
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Empêcher la suppression de l'admin principal
  if (userId === 1) {
    return res.status(400).json({ message: 'Impossible de supprimer le compte administrateur principal' });
  }
  
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  console.log(`🗑️ User deleted by admin: ${deletedUser.email}`);
  
  res.json({ message: 'Utilisateur supprimé avec succès' });
});

// Route admin - Statistiques
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const stats = {
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    regularUsers: users.filter(u => u.role === 'user').length,
    recentUsers: users.filter(u => {
      const userDate = new Date(u.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return userDate > weekAgo;
    }).length,
    usersByCompany: users.reduce((acc, user) => {
      const company = user.company || 'Sans entreprise';
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {})
  };
  
  res.json(stats);
});

// ROUTES EXISTANTES ADAPTÉES

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Brain Invest Backend Server',
    timestamp: new Date().toISOString()
  });
});

// Routes API MongoDB (protégées par authentification)
app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//Routes pour conversations
app.get('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    console.log(`🔍 Fetching conversations for user ID: ${userId} (${req.user.email})`);
    
    const conversations = await Conversation.find({ 
      userId: userId,
      // Exclure les conversations vides automatiquement
      $expr: {
        $gt: [
          {
            $size: {
              $filter: {
                input: "$messages",
                as: "message",
                cond: { $eq: ["$$message.role", "user"] }
              }
            }
          },
          0
        ]
      }
    }).sort({ updatedAt: -1 });
    
    console.log(`✅ Found ${conversations.length} valid conversations for user ${req.user.email}`);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
});

app.post('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    console.log(`📝 Creating conversation for user ID: ${userId} (${req.user.email})`);
    // FORCER l'userId dans les données
    const conversationData = {
      ...req.body,
      userId: userId, // OBLIGATOIRE - vient du token
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Validation supplémentaire
    if (!conversationData.title || !conversationData.messages) {
      return res.status(400).json({ error: 'Titre et messages requis' });
    }
    const conversation = new Conversation(conversationData);
    await conversation.save();
    
    console.log(`✅ Conversation created: ${conversation._id} for user ${req.user.email}`);
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(400).json({ error: 'Erreur lors de la création de la conversation' });
  }
});

app.put('/api/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const conversationId = req.params.id;
    
    console.log(`🔄 Updating conversation ${conversationId} for user ID: ${userId}`);
    
    // DOUBLE VÉRIFICATION: conversation existe ET appartient à l'utilisateur
    const existingConv = await Conversation.findOne({
      _id: conversationId,
      userId: userId
    });
    
    if (!existingConv) {
      console.log(`❌ Conversation ${conversationId} not found or access denied for user ${req.user.email}`);
      return res.status(404).json({ error: 'Conversation non trouvée ou accès refusé' });
    }
    
    // FORCER l'userId dans la mise à jour
    const updateData = {
      ...req.body,
      userId: userId, // TOUJOURS maintenir l'userId
      updatedAt: new Date()
    };
    
    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId: userId },
      updateData,
      { new: true }
    );
    
    console.log(`✅ Conversation updated: ${conversation._id} for user ${req.user.email}`);
    res.json(conversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(400).json({ error: 'Erreur lors de la mise à jour' });
  }
});


app.delete('/api/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const conversationId = req.params.id;
    
    console.log(`🗑️ Deleting conversation ${conversationId} for user ID: ${userId}`);
    
    // VÉRIFICATION DOUBLE SÉCURITÉ
    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      userId: userId // OBLIGATOIRE - empêche la suppression des conversations d'autres utilisateurs
    });
    
    if (!conversation) {
      console.log(`❌ Conversation ${conversationId} not found or access denied for user ${req.user.email}`);
      return res.status(404).json({ error: 'Conversation non trouvée ou accès refusé' });
    }
    
    console.log(`✅ Conversation deleted: ${conversationId} by user ${req.user.email}`);
    res.json({ message: 'Conversation supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});
// Route de nettoyage améliorée (ADMIN SEULEMENT)
app.post('/api/admin/cleanup-conversations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { targetUserId, dryRun = false } = req.body;
    
    console.log(`🧹 Admin cleanup started by ${req.user.email}, target: ${targetUserId || 'ALL'}, dryRun: ${dryRun}`);
    
    // Construire le filtre
    let filter = {
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { userId: "" },
        // Conversations sans messages utilisateur
        {
          $expr: {
            $eq: [
              {
                $size: {
                  $filter: {
                    input: "$messages",
                    as: "message",
                    cond: { $eq: ["$$message.role", "user"] }
                  }
                }
              },
              0
            ]
          }
        }
      ]
    };
    
    // Si un utilisateur spécifique est ciblé
    if (targetUserId) {
      filter = {
        userId: targetUserId,
        $expr: {
          $eq: [
            {
              $size: {
                $filter: {
                  input: "$messages",
                  as: "message",
                  cond: { $eq: ["$$message.role", "user"] }
                }
              }
            },
            0
          ]
        }
      };
    }
    
    if (dryRun) {
      // Mode simulation - juste compter
      const count = await Conversation.countDocuments(filter);
      res.json({ 
        message: `${count} conversations seraient supprimées`,
        count: count,
        dryRun: true
      });
    } else {
      // Suppression réelle
      const result = await Conversation.deleteMany(filter);
      
      console.log(`✅ Admin cleanup: ${result.deletedCount} conversations removed`);
      res.json({ 
        message: `${result.deletedCount} conversations orphelines supprimées`,
        deletedCount: result.deletedCount 
      });
    }
  } catch (error) {
    console.error('Error during admin cleanup:', error);
    res.status(500).json({ error: 'Erreur lors du nettoyage' });
  }
});
// Route pour obtenir les statistiques par utilisateur (ADMIN)
app.get('/api/admin/conversation-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Conversation.aggregate([
      {
        $group: {
          _id: "$userId",
          totalConversations: { $sum: 1 },
          totalMessages: { $sum: { $size: "$messages" } },
          userMessages: {
            $sum: {
              $size: {
                $filter: {
                  input: "$messages",
                  as: "message",
                  cond: { $eq: ["$$message.role", "user"] }
                }
              }
            }
          },
          lastActivity: { $max: "$updatedAt" }
        }
      },
      {
        $sort: { totalConversations: -1 }
      }
    ]);
    
    const orphanCount = await Conversation.countDocuments({
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { userId: "" }
      ]
    });
    
    res.json({
      userStats: stats,
      orphanConversations: orphanCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting conversation stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Route MCP Bridge (protégée par authentification)
app.post('/api/mcp/analyze', authenticateToken, async (req, res) => {
  try {
    const { tool, symbol } = req.body;
    
    console.log(`📊 MCP Bridge: ${tool} for ${symbol} (User: ${req.user.email})`);
    
    // Simuler un délai d'analyse
    setTimeout(() => {
      const mockData = {
        'BTC': { price: 45000, change: 2.5, volume: 28000000000 },
        'ETH': { price: 2800, change: 1.8, volume: 15000000000 },
        'AAPL': { price: 175.50, change: 0.75, volume: 45000000 },
        'TSLA': { price: 242.80, change: -1.2, volume: 85000000 },
        'GOOGL': { price: 140.20, change: 1.1, volume: 25000000 },
        'AMZN': { price: 145.30, change: 0.9, volume: 35000000 },
        'NVDA': { price: 875.28, change: 3.2, volume: 28000000 },
        'META': { price: 563.27, change: 1.8, volume: 18000000 },
        'MSFT': { price: 419.55, change: 0.9, volume: 22000000 }
      };

      const stockSymbols = {
        'AAPL': ['AAPL', 'APPLE'],
        'MSFT': ['MSFT', 'MICROSOFT'],
        'GOOGL': ['GOOGL', 'GOOGLE', 'ALPHABET'],
        'AMZN': ['AMZN', 'AMAZON'],
        'TSLA': ['TSLA', 'TESLA'],
        'META': ['META', 'FACEBOOK'],
        'NVDA': ['NVDA', 'NVIDIA'],
        'NFLX': ['NFLX', 'NETFLIX'],
        'AMD': ['AMD'],
        'INTC': ['INTC', 'INTEL'],
        'CRM': ['CRM', 'SALESFORCE'],
        'ORCL': ['ORCL', 'ORACLE'],
        'IBM': ['IBM'],
        'DIS': ['DIS', 'DISNEY'],
        'V': ['VISA'],
        'MA': ['MASTERCARD'],
        'JPM': ['JPM', 'JP MORGAN'],
        'BAC': ['BAC', 'BANK OF AMERICA']
      };

      const cryptoSymbols = {
        'BTC': ['BTC', 'BITCOIN'],
        'ETH': ['ETH', 'ETHEREUM'],
        'ADA': ['ADA', 'CARDANO'],
        'DOT': ['DOT', 'POLKADOT'],
        'SOL': ['SOL', 'SOLANA'],
        'MATIC': ['MATIC', 'POLYGON'],
        'AVAX': ['AVAX', 'AVALANCHE'],
        'LINK': ['LINK', 'CHAINLINK'],
        'UNI': ['UNI', 'UNISWAP'],
        'DOGE': ['DOGE', 'DOGECOIN'],
        'XRP': ['XRP', 'RIPPLE'],
        'LTC': ['LTC', 'LITECOIN'],
        'BCH': ['BCH', 'BITCOIN CASH'],
        'BNB': ['BNB', 'BINANCE COIN']
      };
      
      const baseData = mockData[symbol.toUpperCase()] || { price: 100, change: 0, volume: 1000000 };
      
      const result = {
        success: true,
        symbol: symbol.toUpperCase(),
        analysis: {
          price: baseData.price * (1 + (Math.random() - 0.5) * 0.02), // Variation de ±1%
          change_24h: baseData.change + (Math.random() - 0.5) * 2,
          volume: baseData.volume,
          technical_indicators: {
            rsi: Math.round(Math.random() * 60 + 20),
            macd: (Math.random() - 0.5) * 2,
            bollinger_position: Math.random(),
            support_level: baseData.price * (0.92 + Math.random() * 0.06),
            resistance_level: baseData.price * (1.02 + Math.random() * 0.06),
            recommendation: ['BUY', 'HOLD', 'SELL'][Math.floor(Math.random() * 3)]
          },
          market_sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
          confidence_score: Math.round((Math.random() * 0.4 + 0.6) * 100) / 100
        },
        timestamp: new Date().toISOString(),
        requestedBy: req.user.email
      };
      
      res.json(result);
    }, 1000);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: error.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Brain Invest Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Authentication routes configured`);
  console.log(`👑 Admin account: admin@braininvest.com / admin123`);
  console.log(`🧠 MCP Bridge: Ready for authenticated requests`);
});