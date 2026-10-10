import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

import {
  Landmark, TrendingUp, Calculator, ShieldCheck, Clock, DollarSign,
  ArrowUpRight, ExternalLink, Sparkles, Filter, CheckCircle2,
  Percent, ChevronRight, Zap, Info
} from 'lucide-react';

const DEPOSIT_APPS = [
  {
    id: 'wealthfront',
    name: 'Wealthfront Cash',
    tagline: 'Industry-leading APY with massive $8M FDIC insurance',
    category: 'hysa',
    categoryLabel: 'High-Yield Savings',
    apy: 5.00,
    apyBoost: 'Up to 5.50% with referral',
    term: 'Instant Access (No Lock-in)',
    termType: 'liquid',
    minDeposit: 1,
    insurance: 'FDIC Insured up to $8 Million',
    features: [
      'Zero account or transfer fees',
      'Free same-day withdrawals',
      'Automatic bill pay & direct deposit',
      'Daily compound interest'
    ],
    url: 'https://www.wealthfront.com/cash',
    badge: 'Best Overall HYSA',
    popular: true,
  },
  {
    id: 'sofi',
    name: 'SoFi Checking & Savings',
    tagline: 'High yield + zero fees + early direct deposit',
    category: 'hysa',
    categoryLabel: 'High-Yield Savings',
    apy: 4.60,
    apyBoost: '4.60% APY with direct deposit',
    term: 'Instant Access (No Lock-in)',
    termType: 'liquid',
    minDeposit: 0,
    insurance: 'FDIC Insured up to $2 Million',
    features: [
      'No monthly maintenance fees',
      '0.50% APY on checking account balance',
      'Up to 2-day early paycheck arrival',
      'Automated savings vaults & roundups'
    ],
    url: 'https://www.sofi.com/banking/',
    badge: 'Best All-in-One Banking',
    popular: true,
  },
  {
    id: 'marcus',
    name: 'Marcus by Goldman Sachs',
    tagline: 'Wall Street pedigree with ultra-reliable yield',
    category: 'hysa',
    categoryLabel: 'High-Yield Savings',
    apy: 4.40,
    apyBoost: '5.40% APY for 3 months with referral',
    term: 'Instant Access (No Lock-in)',
    termType: 'liquid',
    minDeposit: 0,
    insurance: 'FDIC Insured up to $250,000',
    features: [
      'No minimum deposit required',
      'No monthly fees or transfer fees',
      'Same-day transfers under $100k',
      'High-yield CDs also available'
    ],
    url: 'https://www.marcus.com/us/en/savings',
    badge: 'Goldman Sachs Backed',
    popular: false,
  },
  {
    id: 'raisin',
    name: 'Raisin (Deposit Marketplace)',
    tagline: 'Single login to access top national CD & savings rates',
    category: 'cd',
    categoryLabel: 'CDs & Term Deposits',
    apy: 5.30,
    apyBoost: 'Up to 5.45% on 6-12 Mo CDs',
    term: '3 Months to 5 Years',
    termType: 'fixed',
    minDeposit: 1,
    insurance: 'FDIC / NCUA Insured via Partner Banks',
    features: [
      'One account, dozens of banks',
      'Lock in high rates for 1 to 5 years',
      'No-penalty CD options available',
      'Zero platform fees'
    ],
    url: 'https://www.raisin.com/en-us/',
    badge: 'Highest Guaranteed CD Yields',
    popular: true,
  },
  {
    id: 'treasurydirect',
    name: 'US TreasuryDirect (T-Bills)',
    tagline: 'Government-backed short term debt exempt from state taxes',
    category: 'treasury',
    categoryLabel: 'Treasury Bills & Bonds',
    apy: 5.15,
    apyBoost: 'State & local tax exempt',
    term: '4 Weeks to 52 Weeks',
    termType: 'fixed',
    minDeposit: 100,
    insurance: '100% Backed by Full Faith of US Govt',
    features: [
      'Zero state or local income tax',
      'Safest dollar deposit vehicle on earth',
      'Automatic reinvestment feature',
      'Fixed guaranteed yield at auction'
    ],
    url: 'https://www.treasurydirect.gov/',
    badge: 'Maximum Safety & Tax Savings',
    popular: false,
  },
  {
    id: 'ally',
    name: 'Ally Bank',
    tagline: 'Pioneer of digital savings with powerful budgeting buckets',
    category: 'hysa',
    categoryLabel: 'High-Yield Savings',
    apy: 4.25,
    apyBoost: 'Daily compounding',
    term: 'Instant Access (No Lock-in)',
    termType: 'liquid',
    minDeposit: 0,
    insurance: 'FDIC Insured up to $250,000',
    features: [
      'Smart savings buckets & surprise savings',
      'No monthly maintenance fees',
      '24/7 customer support',
      'Top-rated mobile app'
    ],
    url: 'https://www.ally.com/bank/online-savings-account/',
    badge: 'Best Budgeting Features',
    popular: false,
  },
  {
    id: 'vanguard',
    name: 'Vanguard Cash Plus & VMFXX',
    tagline: 'Institutional-grade money market fund yield',
    category: 'money_market',
    categoryLabel: 'Money Market & Cash',
    apy: 5.28,
    apyBoost: '7-Day SEC Yield (~5.28%)',
    term: 'Instant Access (Liquid)',
    termType: 'liquid',
    minDeposit: 0,
    insurance: 'FDIC up to $1.25M (Cash Plus) / SIPC',
    features: [
      'Direct sweep into Vanguard investments',
      'Very low expense ratio (0.11%)',
      'High liquidity with check writing',
      'Direct routing numbers for bill pay'
    ],
    url: 'https://investor.vanguard.com/accounts-plans/cash-plus-account',
    badge: 'Best for Investors',
    popular: false,
  },
  {
    id: 'stablemoney',
    name: 'Stable Money / Groww FDs (INR)',
    tagline: 'Curated Indian Bank Fixed Deposits with supreme interest',
    category: 'cd',
    categoryLabel: 'Fixed Deposits (INR)',
    apy: 8.50,
    apyBoost: 'Up to 9.00% for Senior Citizens',
    term: '1 Year to 5 Years',
    termType: 'fixed',
    minDeposit: 1000,
    insurance: 'RBI DICGC Insured up to ₹5 Lakh',
    features: [
      'Unity SFB, Suryoday SFB, Shriram Finance',
      'Book FD in 3 minutes without opening new bank account',
      'Higher rates than SBI / HDFC (6.5% - 7.1%)',
      'Flexible monthly/quarterly payout options'
    ],
    url: 'https://stablemoney.in/',
    badge: 'Top Indian Fixed Deposits',
    popular: true,
  },
];

export default function SavingsRates() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculator states
  const [initialDeposit, setInitialDeposit] = useState(user?.monthlyIncome ? user.monthlyIncome * 2 : 10000);
  const [monthlyContribution, setMonthlyContribution] = useState(250);
  const [years, setYears] = useState(3);
  const [selectedApy, setSelectedApy] = useState(5.00);
  const [selectedAppName, setSelectedAppName] = useState('Wealthfront Cash (5.00% APY)');

  // Filter states
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Compound Interest Calculation
  const calculation = useMemo(() => {
    const P = Number(initialDeposit) || 0;
    const PMT = Number(monthlyContribution) || 0;
    const t = Number(years) || 1;
    const r = (Number(selectedApy) || 0) / 100;
    const r_month = r / 12;
    const n_months = t * 12;

    let totalAmount = 0;
    if (r_month > 0) {
      const principalCompounded = P * Math.pow(1 + r_month, n_months);
      const contributionsCompounded = PMT * ((Math.pow(1 + r_month, n_months) - 1) / r_month);
      totalAmount = principalCompounded + contributionsCompounded;
    } else {
      totalAmount = P + PMT * n_months;
    }

    const totalPrincipal = P + PMT * n_months;
    const totalInterest = Math.max(0, totalAmount - totalPrincipal);

    // Traditional bank comparison (0.01% APY)
    const trad_r = 0.0001 / 12;
    const tradCompounded = P * Math.pow(1 + trad_r, n_months) + PMT * ((Math.pow(1 + trad_r, n_months) - 1) / trad_r);
    const tradInterest = Math.max(0, tradCompounded - totalPrincipal);
    const extraGain = Math.max(0, totalInterest - tradInterest);

    // Yearly milestones
    const yearlyBreakdown = [];
    for (let yr = 1; yr <= t; yr++) {
      const m = yr * 12;
      const val = P * Math.pow(1 + r_month, m) + (r_month > 0 ? PMT * ((Math.pow(1 + r_month, m) - 1) / r_month) : PMT * m);
      const princ = P + PMT * m;
      yearlyBreakdown.push({
        year: yr,
        total: Math.round(val),
        interest: Math.round(val - princ),
        principal: Math.round(princ),
      });
    }

    return {
      totalAmount: Math.round(totalAmount),
      totalPrincipal: Math.round(totalPrincipal),
      totalInterest: Math.round(totalInterest),
      tradInterest: Math.round(tradInterest),
      extraGain: Math.round(extraGain),
      yearlyBreakdown,
    };
  }, [initialDeposit, monthlyContribution, years, selectedApy]);

  const [appsList] = useState(DEPOSIT_APPS);

  // Filtered deposit apps
  const filteredApps = useMemo(() => {
    return appsList.filter((app) => {
      const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
      const matchesSearch =
        (app.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.tagline || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.categoryLabel || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [appsList, activeCategory, searchQuery]);

  const selectAppForCalc = (app) => {
    setSelectedApy(app.apy);
    setSelectedAppName(`${app.name} (${app.apy}% APY)`);
    // Smooth scroll to calculator
    document.getElementById('interest-calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  const currencySymbol = user?.currency || '$';

  return (
    <div className="flex h-screen bg-surface-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900/60 via-surface-800 to-purple-950/40 border border-brand-500/20 p-6 md:p-10">
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                Live 2026 Market Rates (Up to 5.50% - 8.50% APY)
              </div>
              <h1 className="font-display font-800 text-3xl md:text-4xl text-white tracking-tight">
                High-Yield Deposit & Savings Apps
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Stop losing money to inflation in low-yield 0.01% accounts. Compare verified market platforms, see exact interest rates (APY), and calculate your compounded interest returns over 1 to 20 years.
              </p>

              {/* Quick Stat Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                <div className="glass-subtle rounded-2xl p-3.5 border border-surface-500">
                  <p className="text-slate-400 text-xs font-medium">Top High-Yield APY</p>
                  <p className="text-emerald-400 font-display font-700 text-xl md:text-2xl mt-0.5">5.50% APY</p>
                  <p className="text-slate-500 text-[11px]">FDIC Insured & Liquid</p>
                </div>
                <div className="glass-subtle rounded-2xl p-3.5 border border-surface-500">
                  <p className="text-slate-400 text-xs font-medium">Average Big Bank</p>
                  <p className="text-rose-400 font-display font-700 text-xl md:text-2xl mt-0.5">0.01% APY</p>
                  <p className="text-slate-500 text-[11px]">Nearly 0% interest</p>
                </div>
                <div className="glass-subtle rounded-2xl p-3.5 border border-surface-500 col-span-2 sm:col-span-1">
                  <p className="text-slate-400 text-xs font-medium">Yield Difference</p>
                  <p className="text-brand-400 font-display font-700 text-xl md:text-2xl mt-0.5">500x More</p>
                  <p className="text-slate-500 text-[11px]">Free interest in your pocket</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: Interactive Compound Interest Calculator */}
          <div id="interest-calculator" className="glass rounded-3xl border border-surface-500 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-600 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-brand-600 flex items-center justify-center text-white">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-700 text-xl text-white">Compound Interest Growth Calculator</h2>
                  <p className="text-slate-400 text-xs">Simulate your exact savings balance and interest earned after multiple years</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-700 border border-surface-500 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Rate: <strong className="text-emerald-400 font-semibold">{selectedApy}% APY</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Calculator Inputs */}
              <div className="lg:col-span-5 space-y-5">
                {/* Initial Deposit */}
                <div>
                  <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                    <span className="text-slate-300">Initial Deposit Amount</span>
                    <span className="text-brand-400 font-semibold">{currencySymbol} {Number(initialDeposit).toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">{currencySymbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={initialDeposit}
                      onChange={(e) => setInitialDeposit(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-surface-700 border border-surface-500 focus:border-brand-500 rounded-xl py-2.5 pl-8 pr-4 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[1000, 5000, 10000, 25000, 50000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setInitialDeposit(amt)}
                        className={`text-[11px] px-2 py-1 rounded-lg border transition-all ${
                          initialDeposit === amt
                            ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
                            : 'bg-surface-700/50 border-surface-600 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        +{amt >= 1000 ? `${amt / 1000}k` : amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly Contribution */}
                <div>
                  <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                    <span className="text-slate-300">Monthly Contribution (Auto-save)</span>
                    <span className="text-brand-400 font-semibold">{currencySymbol} {Number(monthlyContribution).toLocaleString()} / mo</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">{currencySymbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-surface-700 border border-surface-500 focus:border-brand-500 rounded-xl py-2.5 pl-8 pr-4 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[0, 100, 250, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setMonthlyContribution(amt)}
                        className={`text-[11px] px-2 py-1 rounded-lg border transition-all ${
                          monthlyContribution === amt
                            ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
                            : 'bg-surface-700/50 border-surface-600 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {currencySymbol}{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Horizon */}
                <div>
                  <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                    <span className="text-slate-300">Time Horizon (Deposit Period)</span>
                    <span className="text-purple-400 font-semibold">{years} {years === 1 ? 'Year' : 'Years'}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 2, 3, 5, 10, 20].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setYears(yr)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                          years === yr
                            ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                            : 'bg-surface-700/50 border-surface-600 text-slate-400 hover:text-white'
                        }`}
                      >
                        {yr}y
                      </button>
                    ))}
                  </div>
                </div>

                {/* APY Rate Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                    <span className="text-slate-300">Annual Percentage Yield (APY)</span>
                    <span className="text-emerald-400 font-semibold">{selectedApy}% APY</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={selectedApy}
                    onChange={(e) => {
                      setSelectedApy(Number(e.target.value));
                      setSelectedAppName(`Custom (${e.target.value}% APY)`);
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>1.0%</span>
                    <span>4.5% (Avg HYSA)</span>
                    <span>5.5% (Top CD)</span>
                    <span>8.5% (FD)</span>
                    <span>10.0%</span>
                  </div>
                </div>
              </div>

              {/* Calculator Output Display */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-5 bg-surface-800/80 rounded-2xl border border-surface-600 p-5 md:p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Projected Balance</p>
                    <span className="text-xs text-slate-400">After {years} {years === 1 ? 'Year' : 'Years'}</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl md:text-5xl font-display font-800 text-white tracking-tight">
                      {currencySymbol} {calculation.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Split Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="glass-subtle rounded-xl p-4 border border-surface-600">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-brand-400" />
                      Total Principal Deposited
                    </div>
                    <p className="font-display font-700 text-lg text-slate-200">
                      {currencySymbol} {calculation.totalPrincipal.toLocaleString()}
                    </p>
                  </div>

                  <div className="glass-subtle rounded-xl p-4 border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Pure Interest Earned
                    </div>
                    <p className="font-display font-700 text-lg text-emerald-400">
                      +{currencySymbol} {calculation.totalInterest.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Comparison with Traditional 0.01% Bank */}
                <div className="rounded-xl bg-gradient-to-r from-emerald-950/40 via-surface-700 to-surface-700 border border-emerald-500/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <Zap className="w-4 h-4" />
                    Extra Wealth Gained vs Traditional Bank (0.01% APY):
                  </div>
                  <p className="text-white text-sm">
                    You earn <strong className="text-emerald-400 font-bold">+{currencySymbol} {calculation.extraGain.toLocaleString()}</strong> more in interest than leaving this money in a traditional 0.01% bank account (which would only pay {currencySymbol} {calculation.tradInterest})!
                  </p>
                </div>

                {/* Year by Year Growth Timeline */}
                <div className="border-t border-surface-600 pt-3">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Yearly Growth Progression:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {calculation.yearlyBreakdown.slice(0, 5).map((row) => (
                      <div key={row.year} className="bg-surface-700/60 rounded-lg p-2 text-center text-xs">
                        <p className="text-slate-500 font-medium">Year {row.year}</p>
                        <p className="text-white font-semibold mt-0.5">{currencySymbol}{row.total.toLocaleString()}</p>
                        <p className="text-emerald-400 text-[10px]">+{currencySymbol}{row.interest.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Curated Deposit Apps & Platform Directory */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-700 text-2xl text-white">
                  Best Running Market Deposit Platforms (2026)
                </h2>
                <p className="text-slate-400 text-xs md:text-sm mt-0.5">
                  Verified platforms offering the highest insured interest rates and flexible terms
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search app or deposit type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-600 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Platforms' },
                { id: 'hysa', label: 'High-Yield Savings (Liquid)' },
                { id: 'cd', label: 'Fixed Deposits / CDs' },
                { id: 'treasury', label: 'US Treasuries & T-Bills' },
                { id: 'money_market', label: 'Money Market & Sweep' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                      : 'glass-subtle text-slate-400 hover:text-white hover:bg-surface-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Platform Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="glass-card rounded-3xl border border-surface-500 p-6 flex flex-col justify-between space-y-5 hover:border-brand-500/40 transition-all duration-200"
                >
                  {/* Card Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {app.badge && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[11px] font-semibold mb-1.5">
                            {app.badge}
                          </span>
                        )}
                        <h3 className="font-display font-700 text-xl text-white">{app.name}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{app.tagline}</p>
                      </div>

                      {/* Prominent APY Badge */}
                      <div className="text-right flex-shrink-0">
                        <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-display font-800 text-xl md:text-2xl shadow-sm">
                          {app.apy.toFixed(2)}%
                          <span className="text-xs font-semibold ml-1">APY</span>
                        </div>
                        {app.apyBoost && (
                          <p className="text-[10px] text-emerald-300/80 mt-1">{app.apyBoost}</p>
                        )}
                      </div>
                    </div>

                    {/* Metadata chips */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300 bg-surface-700/50 rounded-xl px-3 py-2">
                        <Clock className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                        <span className="truncate">{app.term}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300 bg-surface-700/50 rounded-xl px-3 py-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{app.insurance}</span>
                      </div>
                    </div>

                    {/* Key Features List */}
                    <div className="space-y-1.5 pt-2">
                      {app.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-surface-600 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => selectAppForCalc(app)}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/30 text-brand-300 text-xs font-semibold transition-all"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      Calculate Growth
                    </button>

                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-700 hover:bg-surface-600 border border-surface-500 text-slate-200 text-xs font-semibold transition-all"
                    >
                      Visit App
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Knowledge Guide & AI Recommendation Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-surface-800 to-surface-700 border border-surface-500 p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-700 text-lg text-white">Need a Custom Deposit Strategy?</h3>
                <p className="text-slate-400 text-xs">Ask FinanceAI to build an emergency fund or multi-year deposit allocation plan tailored to your exact income</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => navigate('/chat')}
                className="p-3.5 glass-subtle rounded-2xl text-left border border-surface-500 hover:border-brand-500/40 hover:bg-brand-600/10 transition-all"
              >
                <p className="text-white text-xs font-semibold">💰 HYSA vs CDs for $10k?</p>
                <p className="text-slate-400 text-[11px] mt-1">Get an optimal split between instant access and guaranteed term yield.</p>
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="p-3.5 glass-subtle rounded-2xl text-left border border-surface-500 hover:border-brand-500/40 hover:bg-brand-600/10 transition-all"
              >
                <p className="text-white text-xs font-semibold">🏦 5-Year Laddering Strategy</p>
                <p className="text-slate-400 text-[11px] mt-1">Learn how to ladder certificates of deposit to compound interest every year.</p>
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="p-3.5 glass-subtle rounded-2xl text-left border border-surface-500 hover:border-brand-500/40 hover:bg-brand-600/10 transition-all"
              >
                <p className="text-white text-xs font-semibold">🛡️ Tax-Free Treasuries vs HYSA</p>
                <p className="text-slate-400 text-[11px] mt-1">Discover how US Treasury bills save you money on state & local taxes.</p>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
