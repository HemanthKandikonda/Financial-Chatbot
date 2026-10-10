import { validationResult } from 'express-validator';
import Chat from '../models/Chat.js';
import ChatbotConfig from '../models/ChatbotConfig.js';
import { executeChatCompletion, PROVIDER_CONFIGS } from '../services/llmService.js';


const buildSystemPrompt = (user, config) => {
  const riskMap = {
    conservative: 'conservative (prefers low-risk, stable investments like HYSAs, CDs, Treasuries)',
    moderate: 'moderate (balanced approach between broad index funds and safe fixed-income)',
    aggressive: 'aggressive (comfortable with higher risk, equities, and growth assets for potential high returns)',
  };

  const focusText = (config.focusAreas || []).join(', ');
  const styleMap = {
    concise: 'Give short, direct, to-the-point answers.',
    detailed: 'Give comprehensive, step-by-step answers with clear calculations and examples.',
    balanced: 'Give clear, informative answers with moderate detail and actionable steps.',
  };

  let prompt = `You are ${config.botName || 'FinanceAI'}, an expert personal finance advisor and investment AI assistant.

USER FINANCIAL PROFILE (DATABASE):
- Name: ${user.name}
- Monthly Income: ${user.monthlyIncome ? `${user.currency} ${user.monthlyIncome.toLocaleString()}` : 'Not provided'}
- Preferred Currency: ${user.currency || 'USD'}
- Primary Financial Goal: ${user.financialGoal || 'Not provided'}
- Risk Tolerance: ${riskMap[config.riskTolerance] || 'moderate'}
- Preferred Focus Areas: ${focusText || 'general finance'}

RESPONSE STYLE & PREFERENCES:
- Style: ${styleMap[config.responseStyle] || styleMap.balanced}
- ${config.useEmoji ? 'Use relevant emojis to make responses engaging.' : 'Do not use emojis.'}
${config.showDisclaimer !== false ? '- Append a brief disclaimer at the end when giving financial guidance: "⚠️ This is for informational purposes only, not professional financial advice."' : ''}

CONVERSATION & INTENT GUIDELINES:
1. GREETINGS & SMALL TALK: If the user sends a greeting (e.g., "hi", "hello", "hey", "good morning", "howdy"), reply warmly with a brief greeting, introduce yourself as ${config.botName || 'FinanceAI'}, and ask how you can help them with their finances today. DO NOT output a full financial report, table, or advice for a greeting.
2. DIRECT RELEVANCE: Directly answer the specific question asked in the user's latest message.
3. USE ACTUAL USER DATA: Incorporate the user's actual profile data (income: ${user.monthlyIncome || 'N/A'}, goal: "${user.financialGoal || 'N/A'}", risk: ${config.riskTolerance || 'moderate'}) into calculations and advice when relevant.
4. MISSING DETAILS: If the user asks for personalized advice (e.g., budgeting, debt plan) but key numbers are missing from their profile or prompt, ask polite follow-up questions to get their actual figures instead of making up numbers.
5. DOMAIN KNOWLEDGE:
   - For savings/deposits: Recommend active high-yield accounts with APY rates (Wealthfront ~5.0%, SoFi ~4.6%, Marcus ~4.4%, CDs ~5.0-5.5%, T-Bills ~5.0%).
   - For budgeting: Explain frameworks like 50/30/20 adapted to their income.
   - For debt: Explain Avalanche (highest interest first) vs. Snowball (smallest balance first).
   - For investing: Tailor index fund (VOO, VTI) vs bond allocations according to their ${config.riskTolerance || 'moderate'} risk profile.`;

  if (config.systemPromptAddition) {
    prompt += `\n\nADDITIONAL USER INSTRUCTIONS:\n${config.systemPromptAddition}`;
  }

  return prompt;
};

// Intelligent local financial advisor fallback for when OpenAI/LLM API is unavailable or out of quota
const generateFinancialFallback = (user, config, message) => {
  const query = (message || '').toLowerCase().trim();
  const currency = user.currency || '$';
  const income = user.monthlyIncome || 0;
  const goal = user.financialGoal || 'building long-term wealth';
  const risk = config.riskTolerance || 'moderate';

  // 1. Check for Greetings
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'hi there', 'hello there', 'howdy', 'sup', 'yo'];
  const isGreeting = greetings.includes(query) || greetings.some(g => query.startsWith(g + ' ') || query.startsWith(g + ',') || query.startsWith(g + '!'));

  if (isGreeting || query.length < 2) {
    const firstName = user.name ? user.name.split(' ')[0] : 'there';
    let res = `Hello ${firstName}! 👋\n\nI'm **${config.botName || 'FinanceAI'}**, your personal financial advisor. How can I assist you with your money goals today?\n\nYou can ask me about:\n- 📊 **Budgeting & Expenses** (e.g. 50/30/20 breakdown for your income)\n- 🏦 **High-Yield Savings & Deposits** (top APY interest rates)\n- 📈 **Investments & Portfolio Allocation** (tailored to your ${risk} risk profile)\n- 💳 **Debt Payoff Strategies** (Avalanche vs. Snowball)\n- 🛡️ **Emergency Funds & Savings Goals**`;
    if (config.showDisclaimer !== false) {
      res += `\n\n> ⚠️ *This is for informational and educational purposes only, not professional financial advice.*`;
    }
    return res;
  }

  // 2. Check for Thank You / Gratitude
  if (['thanks', 'thank you', 'thx', 'thank you so much', 'awesome', 'great'].includes(query)) {
    return `You're very welcome! 😊 Feel free to ask whenever you have more financial questions. Happy saving and investing!`;
  }

  // 3. Check for Identity / Capabilities
  if (query.includes('who are you') || query.includes('what can you do') || query === 'help') {
    return `I am **${config.botName || 'FinanceAI'}**, your personal AI financial assistant!\n\nI'm here to help you with:\n- **Personalized Budgeting**: Breakdown based on your monthly income (${income > 0 ? `${currency} ${income.toLocaleString()}` : 'set in profile'}).\n- **High-Yield Savings**: Comparing top rates (Wealthfront, SoFi, Marcus, CDs, T-Bills).\n- **Investment Guidance**: Asset allocation matching your **${risk}** risk tolerance.\n- **Debt Payoff**: Step-by-step payoff plans.\n- **Goal Tracking**: Working towards **${goal}**.\n\nWhat would you like to explore first?`;
  }

  // 4. Domain Specific Queries
  let response = '';

  if (query.includes('deposit') || query.includes('interest') || query.includes('hysa') || query.includes('fixed deposit') || query.includes('fd') || query.includes('cd') || query.includes('park') || (query.includes('save') && (query.includes('app') || query.includes('where') || query.includes('rate') || query.includes('grow')))) {
    const depositSample = income > 0 ? income * 2 : 10000;
    const yr1_5pct = (depositSample * Math.pow(1 + 0.05 / 12, 12) - depositSample).toFixed(0);
    const yr3_5pct = (depositSample * Math.pow(1 + 0.05 / 12, 36) - depositSample).toFixed(0);
    const yr5_5pct = (depositSample * Math.pow(1 + 0.05 / 12, 60) - depositSample).toFixed(0);
    const tradBankGain = (depositSample * 0.0001 * 5).toFixed(0);

    response = `### 🏦 Top Market Apps & Platforms to Deposit Savings & Earn High Interest\n\n` +
      `Here are the highest-rated active market platforms to deposit your savings to earn guaranteed, insured interest:\n\n` +
      `| Platform / App | Category | Rate of Interest (APY) | Lock-in / Term | Safety & Insurance |\n` +
      `| :--- | :--- | :--- | :--- | :--- |\n` +
      `| **Wealthfront Cash** | High-Yield Savings | **5.00% – 5.50% APY** | Instant Access (0 Lock-in) | FDIC Insured up to $8 Million |\n` +
      `| **SoFi Banking** | High-Yield Savings | **4.60% APY** | Instant Access (0 Lock-in) | FDIC Insured up to $2 Million |\n` +
      `| **Marcus by Goldman Sachs** | High-Yield Savings | **4.40% – 5.40% APY** | Instant Access (0 Lock-in) | FDIC Insured ($250k) |\n` +
      `| **Ally Bank** | Savings + Buckets | **4.25% APY** | Instant Access (0 Lock-in) | FDIC Insured ($250k) |\n` +
      `| **Raisin Marketplace** | Best CD/Deposit Rates | **5.25% – 5.50% APY** | 3 mo to 5 Years | FDIC Insured Partner Banks |\n` +
      `| **Discover / Marcus CDs** | Fixed Term CD | **4.50% – 4.90% APY** | 12 to 36 Months | FDIC Insured ($250k) |\n` +
      `| **TreasuryDirect (US T-Bills)** | Govt Treasury | **4.80% – 5.25% APY** | 4 to 52 Weeks | Backed by US Government (Tax-Exempt State/Local) |\n` +
      `| **Stable Money / Groww (INR)** | Bank Fixed Deposits | **7.50% – 8.50% APY** | 1 to 5 Years | RBI DICGC Insured up to ₹5 Lakh |\n\n` +
      `---\n\n` +
      `### 💰 How Much Interest Will You Earn? (Example with ${currency} ${depositSample.toLocaleString()})\n\n` +
      `If you deposit **${currency} ${depositSample.toLocaleString()}** at a **5.00% APY** rate:\n` +
      `* **After 1 Year**: You earn **+${currency} ${yr1_5pct}** in pure interest *(Total: ${currency} ${(depositSample + Number(yr1_5pct)).toLocaleString()})*\n` +
      `* **After 3 Years**: You earn **+${currency} ${yr3_5pct}** in compound interest *(Total: ${currency} ${(depositSample + Number(yr3_5pct)).toLocaleString()})*\n` +
      `* **After 5 Years**: You earn **+${currency} ${yr5_5pct}** in compound interest *(Total: ${currency} ${(depositSample + Number(yr5_5pct)).toLocaleString()})*\n\n` +
      `*(Compared to a traditional big bank giving 0.01% where you'd earn only ~${currency} ${tradBankGain} over 5 years!)*\n\n` +
      `💡 **Recommendation**: For money you might need in < 1 year (emergency fund), choose **Wealthfront** or **Marcus** (liquid). For money you can leave untouched for 1–3 years, lock in a **Raisin CD / Discover CD** to guarantee your rate!`;
  } else if (query.includes('budget') || query.includes('salary') || query.includes('income') || query.includes('spend')) {
    const needs = income > 0 ? (income * 0.5).toFixed(0) : '50%';
    const wants = income > 0 ? (income * 0.3).toFixed(0) : '30%';
    const savings = income > 0 ? (income * 0.2).toFixed(0) : '20%';

    response = `### 📊 Personalized 50/30/20 Budget Plan\n\n` +
      (income > 0 ? `Based on your monthly income of **${currency} ${income.toLocaleString()}**, here is your recommended monthly budget breakdown:\n\n` : `Here is the recommended 50/30/20 budget framework:\n\n`) +
      `* **50% Needs (${income > 0 ? `${currency} ${needs}` : '50%'})**: Rent/mortgage, utilities, groceries, insurance, and essential expenses.\n` +
      `* **30% Wants (${income > 0 ? `${currency} ${wants}` : '30%'})**: Dining out, entertainment, shopping, hobbies, and subscriptions.\n` +
      `* **20% Savings & Investments (${income > 0 ? `${currency} ${savings}` : '20%'})**: Emergency fund, retirement, high-yield savings, and extra debt payoff.\n\n` +
      `💡 **Action Step**: Set up an automated transfer of ${income > 0 ? `${currency} ${savings}` : '20% of your income'} into your savings/investment account on payday!`;
  } else if (query.includes('invest') || query.includes('stock') || query.includes('crypto') || query.includes('etf')) {
    response = `### 📈 Investment Strategy (${risk.toUpperCase()} Risk Profile)\n\n` +
      `With a **${risk}** risk tolerance and a primary goal of **${goal}**, here is a recommended framework:\n\n` +
      `1. **Broad-Market Index Funds / ETFs**: Low-cost, highly diversified options like S&P 500 (VOO/IVV) or Total Stock Market (VTI).\n` +
      `2. **Dollar-Cost Averaging (DCA)**: Invest a set amount every month automatically to reduce impact of short-term market swings.\n` +
      `3. **Target Asset Allocation**:\n` +
      (risk === 'conservative'
        ? `   - 60% Fixed Income / High-Yield CDs / T-Bills\n   - 35% Broad Market Index ETFs\n   - 5% Cash reserve\n`
        : risk === 'aggressive'
        ? `   - 80% Equities & Growth ETFs (VOO, QQQ)\n   - 15% International ETFs (VXUS)\n   - 5% Speculative / Crypto / Single Stocks\n`
        : `   - 70% Broad Market Index ETFs (e.g. VOO, VTI)\n   - 20% Bonds / Treasury Reserves\n   - 10% Cash / High-Yield Savings\n`) +
      `4. **Rebalance Annually**: Review once a year to adjust back to your target ratios.`;
  } else if (query.includes('emergency') || query.includes('save') || query.includes('saving')) {
    const target3mo = income > 0 ? (income * 3).toFixed(0) : '3-6 months expenses';
    const target6mo = income > 0 ? (income * 6).toFixed(0) : '6 months expenses';

    response = `### 🛡️ Emergency Fund Plan\n\n` +
      `An emergency fund keeps you financially safe when unexpected life events happen.\n\n` +
      `* **Target Goal**: 3 to 6 months of essential living expenses.\n` +
      (income > 0 ? `* **Estimated Target For You**: **${currency} ${target3mo} – ${currency} ${target6mo}**\n` : '') +
      `* **Where to Store It**: High-Yield Savings Account (HYSA) like Wealthfront (5.0% APY) or Marcus (4.4% APY) for high liquid growth.\n` +
      `* **Step 1**: Reach a starter goal of ${currency}1,000 as fast as possible.\n` +
      `* **Step 2**: Expand to full 3-6 months buffer.`;
  } else if (query.includes('debt') || query.includes('credit card') || query.includes('loan')) {
    response = `### 💳 Strategic Debt Payoff Methods\n\n` +
      `Here are the two best methods to eliminate debt:\n\n` +
      `1. **The Avalanche Method (Save Most Interest)**:\n` +
      `   - Pay minimum on all debts.\n` +
      `   - Put all extra funds toward the debt with the **highest interest rate (APR)**.\n\n` +
      `2. **The Snowball Method (Build Quick Wins)**:\n` +
      `   - Pay minimum on all debts.\n` +
      `   - Put all extra funds toward the debt with the **smallest total balance**.\n\n` +
      `💡 **Pro Tip**: Pause using credit cards for new purchases while paying off existing balances.`;
  } else if (query.includes('rent') || query.includes('buy') || query.includes('home') || query.includes('house')) {
    response = `### 🏠 Rent vs. Buy Guidance\n\n` +
      `Key financial guidelines when considering buying vs renting:\n\n` +
      `* **5-Year Horizon Rule**: Buying usually only makes financial sense if staying for 5+ years to recoup closing costs.\n` +
      `* **28/36 Rule**: Keep total housing payment under 28% of gross monthly income.\n` +
      `* **Maintenance**: Budget 1-2% of home value annually for unexpected repairs.\n` +
      `* **Opportunity Cost**: Renting while investing the down payment difference into low-cost index funds often matches home equity long-term.`;
  } else {
    response = `### 💡 Financial Guidance\n\n` +
      `Thanks for reaching out! Regarding your inquiry: **"${message}"**\n\n` +
      `To align with your goal of **${goal}** and **${risk}** risk profile:\n\n` +
      `1. **Assess Cash Flow**: Ensure monthly income (${income > 0 ? `${currency} ${income}` : 'specified in profile'}) exceeds expenses before committing extra funds.\n` +
      `2. **Match Time Horizon**: Short-term goals (< 3 yrs) belong in HYSAs or CDs; long-term goals (> 5 yrs) fit index funds or equities.\n` +
      `3. **Tax Efficiency**: Maximize tax-advantaged accounts (401k/IRA/ISA) where available.\n\n` +
      `Could you clarify a bit more details about what you'd like to calculate or plan? (e.g., budgeting, specific deposit rates, investing strategies)`;
  }

  if (config.showDisclaimer !== false) {
    response += `\n\n> ⚠️ *This is for informational and educational purposes only, not professional financial advice.*`;
  }

  return response;
};

// GET /api/chat/history - Get all chat sessions
export const getChatHistory = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      userId: req.user._id,
      isArchived: false,
    })
      .select('title lastMessageAt messages createdAt')
      .sort({ lastMessageAt: -1 })
      .limit(50);

    res.json({ chats });
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/:chatId - Get a specific chat
export const getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found.' });
    }

    res.json({ chat });
  } catch (err) {
    next(err);
  }
};

// POST /api/chat - Send a message (creates new chat or continues existing)
export const sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0]?.msg || 'Invalid request' });
    }

    const { message, chatId } = req.body;

    // Load config
    const config = (await ChatbotConfig.findOne({ userId: req.user._id })) || {};
    const systemPrompt = buildSystemPrompt(req.user, config);

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
      if (!chat) return res.status(404).json({ error: 'Chat session not found.' });
    } else {
      // Generate clean title from first prompt
      const generatedTitle = message.length > 30 ? message.slice(0, 30) + '...' : message;
      chat = new Chat({ userId: req.user._id, title: generatedTitle, messages: [] });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message, timestamp: new Date() });

    // Build message array for LLM (last 20 messages for context)
    const recentMessages = chat.messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let assistantMessage = '';
    let tokensUsed = 0;
    let modelUsed = 'fallback';
    let providerUsed = 'FinanceAI Intelligent Engine';

    // Execute LLM completion with automatic multi-provider fallback
    const completionResult = await executeChatCompletion({
      systemPrompt,
      recentMessages,
      userConfig: config,
    });

    if (completionResult.success && completionResult.content) {
      assistantMessage = completionResult.content;
      tokensUsed = completionResult.tokensUsed || 0;
      modelUsed = completionResult.modelUsed;
      providerUsed = completionResult.providerUsed;
    } else {
      if (completionResult.error) {
        console.warn(`[Chat] LLM engine notice: ${completionResult.error}. Using FinanceAI domain advisor fallback.`);
      }
      assistantMessage = generateFinancialFallback(req.user, config, message);
    }

    // Save assistant response
    chat.messages.push({ role: 'assistant', content: assistantMessage, timestamp: new Date() });
    chat.lastMessageAt = new Date();
    chat.totalTokensUsed = (chat.totalTokensUsed || 0) + tokensUsed;
    await chat.save();

    res.json({
      chatId: chat._id,
      title: chat.title,
      message: assistantMessage,
      tokensUsed,
      modelUsed,
      providerUsed,
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Failed to process message' });
  }
};

// DELETE /api/chat/:chatId - Archive a chat
export const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, userId: req.user._id },
      { isArchived: true },
      { new: true }
    );

    if (!chat) return res.status(404).json({ error: 'Chat not found.' });

    res.json({ message: 'Chat deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/chat/:chatId/title - Rename a chat
export const renameChat = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, userId: req.user._id },
      { title },
      { new: true }
    );

    if (!chat) return res.status(404).json({ error: 'Chat not found.' });

    res.json({ message: 'Chat renamed.', chat });
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/models - Get available LLM providers and models
export const getAvailableModels = async (req, res, next) => {
  try {
    res.json({ providers: PROVIDER_CONFIGS });
  } catch (err) {
    next(err);
  }
};

