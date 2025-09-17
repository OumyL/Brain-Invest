const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  preferences: {
    theme: { type: String, default: 'light' },
    defaultProject: { type: String, default: 'trading' },
    favoriteSymbols: [String],
    riskTolerance: { type: String, default: 'medium' }
  },
  portfolio: [{
    symbol: String,
    quantity: Number,
    averagePrice: Number,
    currentPrice: Number,
    profitLoss: Number
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);