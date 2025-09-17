const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  projectId: { 
    type: String, 
    default: 'general' 
  },
  messages: [{
    role: { 
      type: String, 
      enum: ['user', 'assistant'], 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    symbol: String,
    analysisData: mongoose.Schema.Types.Mixed,
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);