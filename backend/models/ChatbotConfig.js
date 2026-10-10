import mongoose from 'mongoose';

const chatbotConfigSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // AI Personality & LLM Engine
    botName: {
      type: String,
      default: 'FinanceAI',
      maxlength: [50, 'Bot name cannot exceed 50 characters'],
    },
    llmProvider: {
      type: String,
      default: 'default',
      enum: ['default', 'openai', 'gemini', 'groq', 'ollama', 'openrouter'],
    },
    llmModel: {
      type: String,
      default: 'gpt-4o-mini',
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1.5,
    },
    apiKey: {
      type: String,
      default: '',
    },
    customBaseUrl: {
      type: String,
      default: '',
    },
    systemPromptAddition: {
      type: String,
      default: '',
      maxlength: [1000, 'System prompt addition cannot exceed 1000 characters'],
    },
    // Response Settings
    responseStyle: {
      type: String,
      enum: ['concise', 'detailed', 'balanced'],
      default: 'balanced',
    },
    useEmoji: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'hi', 'ja', 'zh'],
    },
    // Financial Context
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate',
    },
    focusAreas: {
      type: [String],
      default: ['budgeting', 'investing', 'savings'],
      enum: ['budgeting', 'investing', 'savings', 'debt', 'taxes', 'retirement', 'insurance'],
    },
    // Disclaimer
    showDisclaimer: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ChatbotConfig = mongoose.model('ChatbotConfig', chatbotConfigSchema);
export default ChatbotConfig;
