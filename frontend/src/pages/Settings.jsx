import { useState, useEffect } from 'react';
import { configAPI } from '../services/api.js';
import { toast } from 'react-hot-toast';
import { Bot, Save, RotateCcw, Zap, MessageSquare, Target, Sun, Moon, Palette, Cpu, Key, Sliders, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import Sidebar from '../layouts/Sidebar.jsx';

const PROVIDER_PRESETS = [
  {
    id: 'default',
    name: 'Default Engine',
    desc: 'Uses global server model',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gemini-1.5-flash'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    desc: 'GPT-4o, GPT-4o-mini, GPT-3.5',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    desc: 'Ultra-fast, massive context',
    defaultModel: 'gemini-1.5-flash',
    models: ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'],
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    desc: 'Lightning-fast Llama 3.3',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local LLM)',
    desc: 'Completely free & private',
    defaultModel: 'llama3',
    models: ['llama3', 'mistral', 'qwen2.5', 'phi3'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    desc: 'Access 100+ LLMs',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    models: ['meta-llama/llama-3.3-70b-instruct', 'google/gemini-2.0-flash-exp:free'],
  },
];

const FOCUS_AREAS = [
  { key: 'budgeting', label: '💰 Budgeting' },
  { key: 'investing', label: '📈 Investing' },
  { key: 'savings', label: '🏦 Savings' },
  { key: 'debt', label: '💳 Debt' },
  { key: 'taxes', label: '🧾 Taxes' },
  { key: 'retirement', label: '🏖️ Retirement' },
  { key: 'insurance', label: '🛡️ Insurance' },
];

const STYLE_OPTIONS = [
  { value: 'concise', label: 'Concise', desc: 'Short, direct answers' },
  { value: 'balanced', label: 'Balanced', desc: 'Clear with detail' },
  { value: 'detailed', label: 'Detailed', desc: 'Comprehensive explanations' },
];

const RISK_OPTIONS = [
  { value: 'conservative', label: '🛡️ Conservative', desc: 'Low risk, stable' },
  { value: 'moderate', label: '⚖️ Moderate', desc: 'Balanced approach' },
  { value: 'aggressive', label: '🚀 Aggressive', desc: 'High risk, high reward' },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    configAPI.getConfig().then((res) => setConfig(res.data.config)).catch(() => {
      toast.error('Could not load settings.');
    });
  }, []);

  const handleChange = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  const toggleFocus = (area) => {
    const areas = config.focusAreas || [];
    handleChange(
      'focusAreas',
      areas.includes(area) ? areas.filter((a) => a !== area) : [...areas, area]
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await configAPI.updateConfig(config);
      setConfig(res.data.config);
      toast.success('Settings saved! ⚙️');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setResetting(true);
    try {
      const res = await configAPI.resetConfig();
      setConfig(res.data.config);
      toast.success('Settings reset to defaults.');
    } catch {
      toast.error('Failed to reset settings.');
    } finally {
      setResetting(false);
    }
  };

  if (!config) {
    return (
      <div className="flex h-screen bg-surface-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display font-700 text-2xl text-white">AI Configuration</h1>
              <p className="text-slate-500 text-sm mt-0.5">Customize your FinanceAI experience</p>
            </div>
            <button
              id="reset-config-btn"
              onClick={reset}
              disabled={resetting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-400 text-slate-400 hover:text-slate-200 text-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Appearance & Theme */}
          <section className="glass rounded-2xl p-6 mb-5">
            <h2 className="font-display font-600 text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand-500" /> Interface Appearance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                id="theme-light-btn"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  theme === 'light'
                    ? 'bg-brand-500/10 border-brand-500 text-brand-600 shadow-sm'
                    : 'bg-surface-700/60 border-surface-600 text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">Light Theme</p>
                  <p className="text-xs text-slate-500">Clean, crisp, high contrast</p>
                </div>
              </button>

              <button
                type="button"
                id="theme-dark-btn"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  theme === 'dark'
                    ? 'bg-brand-600/20 border-brand-500 text-brand-300 shadow-sm'
                    : 'bg-surface-700/60 border-surface-600 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-900/60 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">Dark Theme</p>
                  <p className="text-xs text-slate-500">Deep, sleek, easy on the eyes</p>
                </div>
              </button>
            </div>
          </section>

          {/* LLM Engine & Model Configuration */}
          <section className="glass rounded-2xl p-6 mb-5">
            <h2 className="font-display font-600 text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-500" /> LLM Model & AI Provider
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  AI Provider Engine
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROVIDER_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        handleChange('llmProvider', p.id);
                        if (p.id !== 'default') {
                          handleChange('llmModel', p.defaultModel);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        (config.llmProvider || 'default') === p.id
                          ? 'bg-brand-500/15 border-brand-500 text-brand-600 dark:text-brand-300 shadow-sm'
                          : 'bg-surface-700/60 border-surface-600 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Model Name / Identifier
                  </label>
                  <input
                    type="text"
                    value={config.llmModel || 'gpt-4o-mini'}
                    onChange={(e) => handleChange('llmModel', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-700 border border-surface-400 text-slate-900 dark:text-white input-focus text-sm"
                    placeholder="e.g. gpt-4o-mini, gemini-1.5-flash, llama3"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Suggestions: {PROVIDER_PRESETS.find(p => p.id === (config.llmProvider || 'default'))?.models?.join(', ') || 'custom model'}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-medium mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">Creativity (Temperature)</span>
                    <span className="text-brand-500 font-semibold">{config.temperature ?? 0.7}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.4"
                    step="0.05"
                    value={config.temperature ?? 0.7}
                    onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>Precise (0.1)</span>
                    <span>Balanced (0.7)</span>
                    <span>Creative (1.2)</span>
                  </div>
                </div>
              </div>

              {/* Optional Custom API Key & Base URL */}
              <div className="border-t border-surface-600/60 pt-3">
                <details className="group">
                  <summary className="text-xs font-semibold text-brand-500 cursor-pointer hover:underline flex items-center gap-1.5 select-none">
                    <Key className="w-3.5 h-3.5" /> Optional: Personal API Key / Local Endpoint (Ollama)
                  </summary>
                  <div className="mt-3 space-y-3 pl-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Personal API Key <span className="text-slate-500 font-normal">(Leave blank to use system key)</span>
                      </label>
                      <input
                        type="password"
                        value={config.apiKey || ''}
                        onChange={(e) => handleChange('apiKey', e.target.value)}
                        placeholder="sk-... or AIzaSy... or gsk_..."
                        className="w-full px-3.5 py-2 rounded-xl bg-surface-700 border border-surface-400 text-slate-900 dark:text-white input-focus text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Custom Base URL <span className="text-slate-500 font-normal">(For Ollama use http://localhost:11434/v1)</span>
                      </label>
                      <input
                        type="text"
                        value={config.customBaseUrl || ''}
                        onChange={(e) => handleChange('customBaseUrl', e.target.value)}
                        placeholder="http://localhost:11434/v1"
                        className="w-full px-3.5 py-2 rounded-xl bg-surface-700 border border-surface-400 text-slate-900 dark:text-white input-focus text-xs"
                      />
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </section>

          {/* Bot Identity */}
          <section className="glass rounded-2xl p-6 mb-5">
            <h2 className="font-display font-600 text-white text-base mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-400" /> Bot Identity
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="bot-name">Bot Name</label>
                <input id="bot-name" type="text" value={config.botName || ''} onChange={(e) => handleChange('botName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white input-focus text-sm"
                  placeholder="FinanceAI" maxLength={50} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="system-prompt">
                  Custom Instructions <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <textarea id="system-prompt" value={config.systemPromptAddition || ''} onChange={(e) => handleChange('systemPromptAddition', e.target.value)}
                  rows={3} maxLength={1000}
                  className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white input-focus text-sm resize-none"
                  placeholder="e.g. Always mention tax implications for US-based users..." />
                <p className="text-slate-600 text-xs mt-1 text-right">{(config.systemPromptAddition || '').length}/1000</p>
              </div>
            </div>
          </section>

          {/* Response Style */}
          <section className="glass rounded-2xl p-6 mb-5">
            <h2 className="font-display font-600 text-white text-base mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-400" /> Response Style
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {STYLE_OPTIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  id={`style-${value}`}
                  type="button"
                  onClick={() => handleChange('responseStyle', value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.responseStyle === value
                      ? 'bg-brand-600/20 border-brand-500/50 text-white'
                      : 'bg-surface-700 border-surface-400 text-slate-400 hover:border-surface-300'
                  }`}
                >
                  <p className="text-sm font-medium mb-0.5">{label}</p>
                  <p className="text-xs opacity-70">{desc}</p>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" id="use-emoji" checked={config.useEmoji} onChange={(e) => handleChange('useEmoji', e.target.checked)}
                  className="w-4 h-4 accent-brand-500 cursor-pointer rounded" />
                <span className="text-sm text-slate-300">Use emojis in responses</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" id="show-disclaimer" checked={config.showDisclaimer} onChange={(e) => handleChange('showDisclaimer', e.target.checked)}
                  className="w-4 h-4 accent-brand-500 cursor-pointer rounded" />
                <span className="text-sm text-slate-300">Show disclaimer</span>
              </label>
            </div>
          </section>

          {/* Financial Context */}
          <section className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-display font-600 text-white text-base mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Financial Context
            </h2>

            <div className="mb-5">
              <p className="text-sm font-medium text-slate-300 mb-2">Risk Tolerance</p>
              <div className="grid grid-cols-3 gap-3">
                {RISK_OPTIONS.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    id={`risk-${value}`}
                    type="button"
                    onClick={() => handleChange('riskTolerance', value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.riskTolerance === value
                        ? 'bg-brand-600/20 border-brand-500/50 text-white'
                        : 'bg-surface-700 border-surface-400 text-slate-400 hover:border-surface-300'
                    }`}
                  >
                    <p className="text-sm font-medium mb-0.5">{label}</p>
                    <p className="text-xs opacity-70">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">Focus Areas</p>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map(({ key, label }) => (
                  <button
                    key={key}
                    id={`focus-${key}`}
                    type="button"
                    onClick={() => toggleFocus(key)}
                    className={`px-3.5 py-1.5 rounded-full text-sm border transition-all ${
                      (config.focusAreas || []).includes(key)
                        ? 'bg-brand-600/20 border-brand-500/50 text-brand-300'
                        : 'bg-surface-700 border-surface-400 text-slate-400 hover:border-surface-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <button
            id="save-settings-btn"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-medium text-sm hover:from-brand-500 hover:to-brand-400 transition-all duration-200 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
