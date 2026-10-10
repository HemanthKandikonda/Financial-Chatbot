import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Sparkles, TrendingUp, ShieldCheck, Info } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || '',
    password: ''
  });
  const [notice, setNotice] = useState(location.state?.message || '');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setForm((prev) => ({ ...prev, email: location.state.email }));
    }
    if (location.state?.message) {
      setNotice(location.state.message);
    }
  }, [location.state]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/chat');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-900 transition-colors">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle compact />
      </div>
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gradient-to-br from-surface-800 via-surface-750 to-surface-900 p-12 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-700 text-xl text-white">FinanceAI</span>
          </div>

          <h1 className="font-display font-800 text-5xl text-white leading-tight mb-6">
            Your AI-Powered<br />
            <span className="gradient-text">Financial Advisor</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Get personalized financial guidance, budgeting tips, and investment insights powered by AI.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: TrendingUp, label: 'Smart investment guidance', color: 'text-brand-400' },
            { icon: ShieldCheck, label: 'Bank-grade security', color: 'text-emerald-400' },
            { icon: Sparkles, label: 'Personalized AI responses', color: 'text-violet-400' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-slate-300 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-700 text-xl text-white">FinanceAI</span>
          </div>

          <h2 className="font-display font-700 text-3xl text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 mb-6">Sign in to your account to continue</p>

          {notice && (
            <div className="mb-6 p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3 text-xs text-brand-300">
              <Info className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="login-email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white placeholder:text-slate-600 input-focus text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white placeholder:text-slate-600 input-focus text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-600 text-sm hover:from-brand-500 hover:to-brand-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed glow-blue"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
