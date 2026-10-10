import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema(
  {
    aiProvider: {
      type: String,
      default: 'openai',
      enum: ['openai', 'gemini', 'groq', 'ollama', 'openrouter', 'custom'],
    },
    aiModel: {
      type: String,
      default: 'gpt-4o-mini',
    },
    apiKey: {
      type: String,
      default: '',
    },
    apiBaseUrl: {
      type: String,
      default: '',
    },
    aiTemperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1.5,
    },
    maxTokens: {
      type: Number,
      default: 1200,
      min: 200,
      max: 4000,
    },
    enableSavingsDirectory: {
      type: Boolean,
      default: true,
    },
    enableBudgetVisualizer: {
      type: Boolean,
      default: true,
    },
    enableAIAdvisor: {
      type: Boolean,
      default: true,
    },
    enableRegistration: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    globalAnnouncement: {
      type: String,
      default: '',
    },
    customSystemInstructions: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
export default AdminSettings;
