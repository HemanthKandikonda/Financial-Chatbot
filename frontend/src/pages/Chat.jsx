import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI, configAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import {
  Send, Plus, MessageSquare, Trash2, Edit3, Check, X,
  Bot, User, Sparkles, ChevronDown, Loader2, Landmark, TrendingUp
} from 'lucide-react';
import Sidebar from '../layouts/Sidebar.jsx';

// Rich Markdown Renderer with full table and list formatting
function renderMarkdown(text) {
  if (!text) return '';
  
  let html = text;

  // Tables
  html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (match) => {
    const rows = match.trim().split(/\r?\n/).map(r => r.trim()).filter(Boolean);
    if (rows.length < 2) return match;
    
    let tableHtml = '<div class="overflow-x-auto my-3 rounded-xl border border-slate-300 dark:border-surface-500 shadow-sm"><table class="w-full text-left text-xs border-collapse">';
    
    // Header
    const headers = rows[0].split('|').slice(1, -1).map(h => h.trim());
    tableHtml += '<thead class="bg-slate-100 dark:bg-surface-700 text-brand-700 dark:text-brand-300 font-semibold border-b border-slate-300 dark:border-surface-500"><tr>';
    headers.forEach(h => {
      tableHtml += `<th class="px-3.5 py-2.5">${h}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    // Data rows (skipping delimiter line if present)
    const dataRows = rows.slice(1).filter(r => !/^\|[-:\s|]+\|$/.test(r));
    dataRows.forEach((row, idx) => {
      const cells = row.split('|').slice(1, -1).map(c => c.trim());
      const bgClass = idx % 2 === 0 ? 'bg-white dark:bg-surface-800/60' : 'bg-slate-50 dark:bg-surface-750/80';
      tableHtml += `<tr class="${bgClass} border-b border-slate-200 dark:border-surface-600/40 hover:bg-brand-500/10 transition-colors">`;
      cells.forEach(c => {
        tableHtml += `<td class="px-3.5 py-2.5 text-slate-800 dark:text-slate-200">${c}</td>`;
      });
      tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table></div>';
    return tableHtml;
  });

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="font-display font-bold text-sm md:text-base text-slate-900 dark:text-white mt-3.5 mb-1.5 flex items-center gap-1.5">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="font-display font-bold text-base md:text-lg text-slate-900 dark:text-white mt-4 mb-2 border-b border-slate-200 dark:border-surface-600 pb-1">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="font-display font-extrabold text-lg text-slate-900 dark:text-white mt-4 mb-2">$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="my-2.5 pl-3 py-1.5 border-l-2 border-brand-500 bg-brand-500/10 text-slate-700 dark:text-slate-300 rounded-r-lg text-xs italic">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="my-3 border-slate-200 dark:border-surface-600" />');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-semibold">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="text-slate-700 dark:text-slate-300">$1</em>');

  // Code inline
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs font-mono">$1</code>');

  // Bullet Lists
  html = html.replace(/(?:^[ \t]*[\*\-][ \t]+[^\n]+(?:\r?\n|$))+/gm, (match) => {
    const items = match.trim().split(/\r?\n/).map(line => {
      return line.replace(/^[ \t]*[\*\-][ \t]+/, '').trim();
    });
    return `<ul class="my-2 space-y-1 pl-1 list-none">${items.map(item => `<li class="flex items-start gap-2 text-slate-800 dark:text-slate-200"><span class="w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-brand-400 mt-2 flex-shrink-0"></span><span>${item}</span></li>`).join('')}</ul>`;
  });

  // Numbered Lists
  html = html.replace(/(?:^[ \t]*\d+\.[ \t]+[^\n]+(?:\r?\n|$))+/gm, (match) => {
    const items = match.trim().split(/\r?\n/).map((line, i) => {
      return line.replace(/^[ \t]*\d+\.[ \t]+/, '').trim();
    });
    return `<ol class="my-2 space-y-1 pl-1">${items.map((item, i) => `<li class="flex items-start gap-2 text-slate-800 dark:text-slate-200"><span class="font-bold text-brand-600 dark:text-brand-400 text-xs mt-0.5">${i+1}.</span><span>${item}</span></li>`).join('')}</ol>`;
  });

  // Line breaks
  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');

  return html;
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 message-enter">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="glass-subtle rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-2 h-2 rounded-full bg-brand-400 typing-dot" />
          <span className="w-2 h-2 rounded-full bg-brand-400 typing-dot" />
          <span className="w-2 h-2 rounded-full bg-brand-400 typing-dot" />
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  const hasBudgetKeywords = !isUser && (msg.content?.toLowerCase().includes('50/30/20') || msg.content?.toLowerCase().includes('budget') || msg.content?.toLowerCase().includes('needs'));
  const hasDepositKeywords = !isUser && (msg.content?.toLowerCase().includes('deposit') || msg.content?.toLowerCase().includes('apy') || msg.content?.toLowerCase().includes('hysa') || msg.content?.toLowerCase().includes('wealthfront'));

  return (
    <div className={`flex items-start gap-3 message-enter ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-brand-600 text-white shadow-sm'
          : 'bg-gradient-to-br from-brand-600 to-violet-600 text-white'
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[85%] md:max-w-[78%] px-4 py-3.5 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'user-message-bubble bg-brand-600 text-white rounded-tr-sm shadow-md'
          : 'glass-subtle rounded-tl-sm border border-slate-200 dark:border-surface-500 text-slate-900 dark:text-slate-100 shadow-sm'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap font-medium text-white">{msg.content}</p>
        ) : (
          <div>
            <div
              className="prose-chat"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />

            {/* Interactive Graph / Tool Bridge Pills */}
            {(hasBudgetKeywords || hasDepositKeywords) && (
              <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-200 dark:border-surface-600">
                {hasBudgetKeywords && (
                  <Link
                    to="/budget"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs font-semibold transition-all"
                  >
                    <span>📊 Open Interactive Budget Pie Chart</span>
                  </Link>
                )}
                {hasDepositKeywords && (
                  <Link
                    to="/savings"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-all"
                  >
                    <span>🏦 Compare Live Market Rates (APY)</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
        <div className={`text-[10px] mt-1.5 ${isUser ? 'text-white/80 text-right font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  '🏦 Best apps to deposit savings & earn high interest?',
  '📈 Where to deposit money for 1 to 5 years (APY rates)?',
  '💰 How should I budget my salary (50/30/20 rule)?',
  '📊 Compare Wealthfront vs Marcus vs Raisin CDs',
  '🛡️ Best account to park my emergency fund?',
  '💳 Strategies to eliminate high-interest debt?',
];

export default function Chat() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [botConfig, setBotConfig] = useState({ botName: 'FinanceAI', llmModel: 'gpt-4o-mini' });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    configAPI.getConfig().then((res) => {
      if (res.data?.config) {
        setBotConfig(res.data.config);
      }
    }).catch(() => {});
  }, []);

  // Load sidebar history
  const loadHistory = useCallback(async () => {
    try {
      const res = await chatAPI.getHistory();
      setChats(res.data.chats);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadChat = async (chatId) => {
    setLoadingChat(true);
    setActiveChatId(chatId);
    try {
      const res = await chatAPI.getChat(chatId);
      setMessages(res.data.chat.messages || []);
    } catch {
      toast.error('Could not load chat.');
    } finally {
      setLoadingChat(false);
    }
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  const handleSend = async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || sending) return;

    setInput('');
    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await chatAPI.sendMessage({ message: text, chatId: activeChatId || undefined });
      const { chatId, message, title } = res.data;

      if (!activeChatId) {
        setActiveChatId(chatId);
      }

      const aiMsg = { role: 'assistant', content: message, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);
      await loadHistory();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send message.';
      toast.error(msg);
      setMessages((prev) => prev.slice(0, -1)); // remove optimistic
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (chatId, e) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) startNewChat();
      toast.success('Chat deleted.');
    } catch {
      toast.error('Could not delete chat.');
    }
  };

  const startRename = (chat, e) => {
    e.stopPropagation();
    setRenamingId(chat._id);
    setRenameValue(chat.title);
  };

  const submitRename = async (chatId) => {
    if (!renameValue.trim()) return;
    try {
      await chatAPI.renameChat(chatId, renameValue.trim());
      setChats((prev) => prev.map((c) => c._id === chatId ? { ...c, title: renameValue.trim() } : c));
    } catch {
      toast.error('Could not rename.');
    } finally {
      setRenamingId(null);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen bg-surface-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar>
        <div className="flex flex-col h-full">
          {/* New chat button */}
          <button
            id="new-chat-btn"
            onClick={startNewChat}
            className="flex items-center gap-2.5 mx-3 mt-3 mb-4 px-3 py-2.5 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/30 text-brand-400 text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
            {chats.length === 0 ? (
              <p className="text-slate-600 text-xs text-center mt-8 px-4">No conversations yet.<br />Start chatting!</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => loadChat(chat._id)}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm ${
                    activeChatId === chat._id
                      ? 'bg-brand-600/15 border border-brand-500/20 text-white'
                      : 'text-slate-400 hover:bg-surface-600 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                  {renamingId === chat._id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitRename(chat._id);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-w-0 bg-surface-700 border border-brand-500/50 rounded px-1.5 py-0.5 text-white text-xs outline-none"
                    />
                  ) : (
                    <span className="flex-1 min-w-0 truncate text-xs">{chat.title}</span>
                  )}

                  {renamingId === chat._id ? (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => submitRename(chat._id)} className="text-emerald-400 hover:text-emerald-300">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={() => setRenamingId(null)} className="text-slate-500 hover:text-slate-300">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="hidden group-hover:flex gap-1">
                      <button
                        onClick={(e) => startRename(chat, e)}
                        className="p-0.5 text-slate-600 hover:text-slate-300 transition-colors"
                        aria-label="Rename chat"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(chat._id, e)}
                        className="p-0.5 text-slate-600 hover:text-red-400 transition-colors"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Sidebar>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-600">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-600 text-slate-900 dark:text-white text-sm">
                {botConfig.botName || 'FinanceAI'}
              </h1>
              <Link
                to="/settings"
                title="Configure active LLM Model in Settings"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-300 text-[10px] font-semibold border border-brand-500/30 transition-colors"
              >
                <span>⚡ {botConfig.llmModel || 'gpt-4o-mini'}</span>
              </Link>
            </div>
            <p className="text-slate-500 text-xs">Personal Financial Advisor</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5">
          {loadingChat ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
            </div>
          ) : isEmpty ? (
            /* Welcome screen */
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center mb-5 glow-blue">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-display font-700 text-2xl text-slate-900 dark:text-white mb-2">
                Hi {user?.name?.split(' ')[0]}! 👋
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 leading-relaxed">
                I'm your personal AI financial advisor. Ask me anything about budgeting, high-yield deposit apps, investing, or debt management.
              </p>

              {/* Live Savings & Deposit Rates Tool Banner */}
              <Link
                to="/savings"
                className="w-full mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-surface-700 to-surface-700 border border-emerald-500/30 hover:border-emerald-500/60 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-slate-900 dark:text-white text-xs font-semibold">Live Market Deposit Apps (4.5% - 8.5% APY)</p>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] rounded font-bold">LIVE</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">Compare Wealthfront, SoFi, Marcus & calculate multi-year interest</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-500 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform font-medium">
                  Open Calculator &rarr;
                </span>
              </Link>

              {/* Quick prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="px-4 py-3 glass-subtle rounded-xl text-left text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-brand-500/40 hover:bg-brand-600/10 transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {sending && <TypingIndicator />}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-4 md:px-8 pb-6 pt-2">
          <div className="relative glass rounded-2xl border border-surface-400 focus-within:border-brand-500/50 transition-all duration-200">
            <textarea
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask about budgeting, investing, saving..."
              disabled={sending}
              className="w-full bg-transparent text-slate-900 dark:text-white px-5 py-4 pr-14 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none outline-none max-h-40 leading-relaxed disabled:opacity-50"
              style={{ minHeight: '56px' }}
            />
            <button
              id="send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || sending}
              className="absolute right-3 bottom-3 w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
              aria-label="Send message"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
          <p className="text-center text-slate-700 text-xs mt-2">
            Press Enter to send · Shift+Enter for new line · ⚠️ Not professional financial advice
          </p>
        </div>
      </div>
    </div>
  );
}
