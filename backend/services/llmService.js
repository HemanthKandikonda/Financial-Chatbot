import OpenAI from 'openai';
import AdminSettings from '../models/AdminSettings.js';

// Provider endpoints configuration
export const PROVIDER_CONFIGS = {
  openai: {
    name: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & Smart)' },
      { id: 'gpt-4o', name: 'GPT-4o (Most Capable)' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
    envKey: 'OPENAI_API_KEY',
  },
  gemini: {
    name: 'Google Gemini',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    defaultModel: 'gemini-1.5-flash',
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Ultra Fast)' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    ],
    envKey: 'GEMINI_API_KEY',
  },
  groq: {
    name: 'Groq Cloud',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    ],
    envKey: 'GROQ_API_KEY',
  },
  ollama: {
    name: 'Ollama (Local LLM)',
    defaultBaseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3',
    models: [
      { id: 'llama3', name: 'Llama 3' },
      { id: 'mistral', name: 'Mistral' },
      { id: 'qwen2.5', name: 'Qwen 2.5' },
      { id: 'phi3', name: 'Phi-3' },
    ],
    envKey: null,
  },
  openrouter: {
    name: 'OpenRouter',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)' },
    ],
    envKey: 'OPENROUTER_API_KEY',
  },
};

/**
 * Resolve effective LLM parameters from User config, Admin settings, and Environment variables
 */
export const resolveLLMConfig = async (userConfig = {}) => {
  const adminSettings = (await AdminSettings.findOne().lean()) || {};

  // 1. Determine Provider
  let provider = 'openai';
  if (userConfig.llmProvider && userConfig.llmProvider !== 'default') {
    provider = userConfig.llmProvider;
  } else if (adminSettings.aiProvider) {
    provider = adminSettings.aiProvider;
  }

  const providerSpec = PROVIDER_CONFIGS[provider] || PROVIDER_CONFIGS.openai;

  // 2. Determine Model
  let model = userConfig.llmModel || adminSettings.aiModel || providerSpec.defaultModel;

  // 3. Determine API Key
  let apiKey = userConfig.apiKey || adminSettings.apiKey;
  if (!apiKey && providerSpec.envKey) {
    apiKey = process.env[providerSpec.envKey];
  }
  // Fallback if provider is gemini but OPENAI_API_KEY was passed or vice versa
  if (!apiKey && provider === 'openai') {
    apiKey = process.env.OPENAI_API_KEY;
  }
  if (!apiKey && provider === 'gemini') {
    apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  }
  if (!apiKey && provider === 'ollama') {
    apiKey = 'ollama'; // Ollama doesn't require key
  }

  // 4. Determine Base URL
  let baseURL = userConfig.customBaseUrl || adminSettings.apiBaseUrl || providerSpec.defaultBaseUrl;

  // 5. Temperature and Max Tokens
  const temperature = typeof userConfig.temperature === 'number'
    ? userConfig.temperature
    : (adminSettings.aiTemperature || 0.7);

  const maxTokens = adminSettings.maxTokens || 1200;

  return {
    provider,
    providerName: providerSpec.name,
    model,
    apiKey,
    baseURL,
    temperature,
    maxTokens,
  };
};

/**
 * Execute chat completion using the resolved LLM configuration
 */
export const executeChatCompletion = async ({
  systemPrompt,
  recentMessages,
  userConfig,
}) => {
  const llm = await resolveLLMConfig(userConfig);

  // If no API key is available (except for ollama), return null to trigger smart fallback
  if (!llm.apiKey && llm.provider !== 'ollama') {
    console.warn(`[LLM Service] No API key available for provider "${llm.providerName}". Using fallback.`);
    return {
      success: false,
      error: `Missing API key for ${llm.providerName}`,
      llmInfo: llm,
    };
  }

  try {
    const client = new OpenAI({
      apiKey: llm.apiKey,
      baseURL: llm.baseURL,
      defaultHeaders: llm.provider === 'openrouter' ? {
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'FinanceAI Bot',
      } : undefined,
    });

    const completion = await client.chat.completions.create({
      model: llm.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentMessages,
      ],
      temperature: llm.temperature,
      max_tokens: llm.maxTokens,
    });

    const content = completion.choices?.[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    return {
      success: true,
      content,
      tokensUsed,
      modelUsed: llm.model,
      providerUsed: llm.providerName,
      llmInfo: llm,
    };
  } catch (err) {
    console.error(`[LLM Service Error] Provider: ${llm.providerName}, Model: ${llm.model} - ${err.message}`);
    return {
      success: false,
      error: err.message,
      llmInfo: llm,
    };
  }
};
