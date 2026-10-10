import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';
import {
  PieChart as PieIcon, TrendingUp, DollarSign, Wallet,
  Sparkles, ArrowUpRight, ShieldAlert, CheckCircle2, Sliders,
  RefreshCw, Layers
} from 'lucide-react';

const BUDGET_COLORS = {
  needs: '#3b82f6',     // Brand Blue
  wants: '#8b5cf6',     // Violet
  savings: '#10b981',   // Emerald
  debt: '#f59e0b',      // Amber
};

const SUB_COLORS = [
  '#3b82f6', '#60a5fa', '#93c5fd', // Needs
  '#8b5cf6', '#a78bfa', '#c4b5fd', // Wants
  '#10b981', '#34d399', '#6ee7b7', // Savings
  '#f59e0b', // Debt
];

export default function BudgetAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // User input states
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthlyIncome || 5000);
  const [needsPct, setNeedsPct] = useState(50);
  const [wantsPct, setWantsPct] = useState(30);
  const [savingsPct, setSavingsPct] = useState(20);

  // Sub-category customization
  const [housing, setHousing] = useState(30);      // % of income
  const [food, setFood] = useState(12);         // % of income
  const [utilities, setUtilities] = useState(8); // % of income
  const [entertainment, setEntertainment] = useState(15);
  const [shopping, setShopping] = useState(15);
  const [investments, setInvestments] = useState(12);
  const [emergencyFund, setEmergencyFund] = useState(8);

  const [growthYears, setGrowthYears] = useState(5);
  const [expectedApy, setExpectedApy] = useState(5.0); // %

  const currencySymbol = user?.currency || '$';

  // Budget 50/30/20 data
  const budgetPieData = useMemo(() => {
    const inc = Number(monthlyIncome) || 0;
    const needsAmount = (inc * needsPct) / 100;
    const wantsAmount = (inc * wantsPct) / 100;
    const savingsAmount = (inc * savingsPct) / 100;

    return [
      { name: 'Needs (Essentials)', value: needsAmount, percentage: needsPct, color: BUDGET_COLORS.needs, desc: 'Housing, utilities, groceries, insurance' },
      { name: 'Wants (Lifestyle)', value: wantsAmount, percentage: wantsPct, color: BUDGET_COLORS.wants, desc: 'Dining out, hobbies, entertainment, shopping' },
      { name: 'Savings & Investments', value: savingsAmount, percentage: savingsPct, color: BUDGET_COLORS.savings, desc: 'Emergency fund, index funds, retirement' },
    ];
  }, [monthlyIncome, needsPct, wantsPct, savingsPct]);

  // Detailed sub-category breakdown data
  const detailedBreakdownData = useMemo(() => {
    const inc = Number(monthlyIncome) || 0;
    return [
      { name: 'Housing / Rent', value: Math.round((inc * housing) / 100), pct: housing, category: 'Needs', color: '#3b82f6' },
      { name: 'Food & Groceries', value: Math.round((inc * food) / 100), pct: food, category: 'Needs', color: '#60a5fa' },
      { name: 'Utilities & Bills', value: Math.round((inc * utilities) / 100), pct: utilities, category: 'Needs', color: '#93c5fd' },
      { name: 'Dining & Fun', value: Math.round((inc * entertainment) / 100), pct: entertainment, category: 'Wants', color: '#8b5cf6' },
      { name: 'Shopping & Subscriptions', value: Math.round((inc * shopping) / 100), pct: shopping, category: 'Wants', color: '#a78bfa' },
      { name: 'Equities & ETFs', value: Math.round((inc * investments) / 100), pct: investments, category: 'Savings', color: '#10b981' },
      { name: 'High-Yield Emergency Fund', value: Math.round((inc * emergencyFund) / 100), pct: emergencyFund, category: 'Savings', color: '#34d399' },
    ];
  }, [monthlyIncome, housing, food, utilities, entertainment, shopping, investments, emergencyFund]);

  // Multi-year compound wealth growth projection
  const wealthGrowthData = useMemo(() => {
    const inc = Number(monthlyIncome) || 0;
    const monthlySave = (inc * savingsPct) / 100;
    const r_hysa = expectedApy / 100 / 12;
    const r_trad = 0.0001 / 12;
    const r_market = 0.085 / 12; // 8.5% diversified ETF growth

    const data = [];
    let hysaTotal = 0;
    let tradTotal = 0;
    let marketTotal = 0;
    let totalDeposited = 0;

    for (let yr = 1; yr <= growthYears; yr++) {
      const months = yr * 12;
      totalDeposited = monthlySave * months;
      
      hysaTotal = r_hysa > 0 
        ? monthlySave * ((Math.pow(1 + r_hysa, months) - 1) / r_hysa)
        : totalDeposited;

      tradTotal = monthlySave * ((Math.pow(1 + r_trad, months) - 1) / r_trad);
      marketTotal = monthlySave * ((Math.pow(1 + r_market, months) - 1) / r_market);

      data.push({
        year: `Year ${yr}`,
        Principal: Math.round(totalDeposited),
        'High-Yield Savings (5% APY)': Math.round(hysaTotal),
        'Index Fund Growth (8.5%)': Math.round(marketTotal),
        'Traditional Bank (0.01%)': Math.round(tradTotal),
      });
    }

    return data;
  }, [monthlyIncome, savingsPct, growthYears, expectedApy]);

  // Reset to standard 50/30/20
  const resetStandard = () => {
    setNeedsPct(50);
    setWantsPct(30);
    setSavingsPct(20);
    setHousing(30);
    setFood(12);
    setUtilities(8);
    setEntertainment(15);
    setShopping(15);
    setInvestments(12);
    setEmergencyFund(8);
  };

  // Custom tooltip for Recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3 rounded-xl border border-surface-500 shadow-xl text-xs space-y-1">
          <p className="font-semibold text-white">{data.name || payload[0].name}</p>
          <p className="text-emerald-400 font-bold">
            {currencySymbol} {Number(data.value || payload[0].value).toLocaleString()}
          </p>
          {data.percentage !== undefined && (
            <p className="text-slate-400">{data.percentage}% of total income</p>
          )}
          {data.desc && <p className="text-slate-500 text-[11px]">{data.desc}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-surface-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-600 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-2">
                <PieIcon className="w-3.5 h-3.5" />
                Visual Budget & Wealth Analytics
              </div>
              <h1 className="font-display font-800 text-3xl text-white">
                Budget Allocation & Growth Visualizer
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Analyze your income distribution, customize expense slices, and simulate compound net worth growth over years.
              </p>
            </div>

            {/* Income Quick Switcher */}
            <div className="glass-subtle p-3 rounded-2xl border border-surface-500 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 flex-shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Monthly Income</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-white text-xs font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
                    className="w-24 bg-surface-700 border border-surface-500 focus:border-brand-500 rounded-lg px-2 py-0.5 text-white text-xs font-bold outline-none"
                  />
                </div>
              </div>
              <button
                onClick={resetStandard}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface-700 transition-colors"
                title="Reset to 50/30/20 rule"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SECTION 1: 50/30/20 Pie Chart & Sliders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Pie Chart Card */}
            <div className="lg:col-span-6 glass rounded-3xl border border-surface-500 p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between border-b border-surface-600 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center text-white">
                    <PieIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display font-700 text-lg text-white">50 / 30 / 20 Budget Distribution</h2>
                    <p className="text-slate-400 text-xs">Income allocated: {currencySymbol} {Number(monthlyIncome).toLocaleString()} / month</p>
                  </div>
                </div>
              </div>

              {/* Recharts Donut Pie Chart */}
              <div className="w-full h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {budgetPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      formatter={(value, entry) => (
                        <span className="text-slate-300 text-xs font-medium ml-1">
                          {value} ({entry.payload.percentage}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics Summary Cards */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {budgetPieData.map((item) => (
                  <div key={item.name} className="glass-subtle rounded-2xl p-3 border border-surface-600 text-center">
                    <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }} />
                    <p className="text-[11px] text-slate-400 font-medium truncate">{item.name.split(' ')[0]}</p>
                    <p className="text-white font-display font-700 text-sm mt-0.5">
                      {currencySymbol}{item.value.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500">{item.percentage}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Category Distribution Bar Chart & Sliders */}
            <div className="lg:col-span-6 glass rounded-3xl border border-surface-500 p-6 md:p-8 flex flex-col justify-between space-y-5">
              <div className="flex items-center justify-between border-b border-surface-600 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-brand-600 flex items-center justify-center text-white">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display font-700 text-lg text-white">Granular Expense Breakdown</h2>
                    <p className="text-slate-400 text-xs">Estimated monthly expenditure by category</p>
                  </div>
                </div>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detailedBreakdownData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `${currencySymbol}${v}`} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={110} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {detailedBreakdownData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Quick Chips */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>🏠 Housing / Rent ({housing}%)</span>
                  <span className="font-bold text-white">{currencySymbol} {Math.round((monthlyIncome * housing) / 100)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>🍔 Food & Essentials ({food + utilities}%)</span>
                  <span className="font-bold text-white">{currencySymbol} {Math.round((monthlyIncome * (food + utilities)) / 100)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>🎉 Lifestyle & Wants ({entertainment + shopping}%)</span>
                  <span className="font-bold text-white">{currencySymbol} {Math.round((monthlyIncome * (entertainment + shopping)) / 100)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 font-semibold">
                  <span>💰 Wealth Building ({investments + emergencyFund}%)</span>
                  <span>{currencySymbol} {Math.round((monthlyIncome * (investments + emergencyFund)) / 100)} / mo</span>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION 2: Multi-Year Compound Wealth Growth Area Chart */}
          <div className="glass rounded-3xl border border-surface-500 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-600 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-violet-600 flex items-center justify-center text-white">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-700 text-xl text-white">Multi-Year Compound Wealth Growth</h2>
                  <p className="text-slate-400 text-xs">
                    Visualizing your monthly savings (${Math.round((monthlyIncome * savingsPct) / 100)}/mo) compounded over {growthYears} years
                  </p>
                </div>
              </div>

              {/* Growth Years Selector */}
              <div className="flex items-center gap-1.5 bg-surface-700 p-1 rounded-xl border border-surface-500">
                {[1, 3, 5, 10, 15, 20].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setGrowthYears(yr)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      growthYears === yr
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {yr}Y
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wealthGrowthData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHysa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
                  <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${v / 1000}k` : v}`} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-800)', borderColor: 'var(--surface-600)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-main)' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                    labelStyle={{ color: 'var(--text-main)' }}
                    formatter={(val, name) => [`${currencySymbol} ${Number(val).toLocaleString()}`, name]}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} />
                  <Area type="monotone" dataKey="Index Fund Growth (8.5%)" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMarket)" />
                  <Area type="monotone" dataKey="High-Yield Savings (5% APY)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHysa)" />
                  <Area type="monotone" dataKey="Principal" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPrincipal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Key Insights Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="glass-subtle rounded-2xl p-4 border border-surface-500">
                <p className="text-slate-400 text-xs font-medium">Total Saved / Invested</p>
                <p className="font-display font-700 text-xl text-white mt-1">
                  {currencySymbol} {((monthlyIncome * savingsPct / 100) * growthYears * 12).toLocaleString()}
                </p>
                <p className="text-slate-500 text-[11px]">Principal accumulated after {growthYears} years</p>
              </div>

              <div className="glass-subtle rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/5">
                <p className="text-emerald-400 text-xs font-medium">High-Yield Balance (5% APY)</p>
                <p className="font-display font-700 text-xl text-emerald-400 mt-1">
                  {currencySymbol} {wealthGrowthData[wealthGrowthData.length - 1]?.['High-Yield Savings (5% APY)']?.toLocaleString()}
                </p>
                <p className="text-emerald-300/70 text-[11px]">Guaranteed compounding with top market apps</p>
              </div>

              <div className="glass-subtle rounded-2xl p-4 border border-purple-500/30 bg-purple-500/5">
                <p className="text-purple-400 text-xs font-medium">Index Fund Balance (8.5%)</p>
                <p className="font-display font-700 text-xl text-purple-300 mt-1">
                  {currencySymbol} {wealthGrowthData[wealthGrowthData.length - 1]?.['Index Fund Growth (8.5%)']?.toLocaleString()}
                </p>
                <p className="text-purple-300/70 text-[11px]">Diversified market equity compounding</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: Bridge to AI Assistant */}
          <div className="rounded-3xl bg-gradient-to-r from-brand-900/40 via-surface-800 to-surface-800 border border-brand-500/30 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-700 text-lg text-white">Ask FinanceAI to Optimize Your Budget</h3>
                <p className="text-slate-400 text-xs md:text-sm">
                  Get personalized recommendations on reducing lifestyle costs, building your emergency fund, and choosing high-yield accounts.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all flex-shrink-0 shadow-lg shadow-brand-600/30"
            >
              Consult AI Advisor
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
