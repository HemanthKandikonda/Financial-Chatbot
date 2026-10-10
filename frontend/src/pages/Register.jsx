import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { toast } from 'react-hot-toast';
import {
  Eye, EyeOff, Mail, Lock, User, DollarSign, Target, Sparkles, Info, ArrowRight
} from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    currency: 'USD', monthlyIncome: '', financialGoal: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingEmailError, setExistingEmailError] = useState('');

  const handleChange = (e) => {
    setExistingEmailError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const nextStep = (e) => {
    e.preventDefault();
    setExistingEmailError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setExistingEmailError('');
    try {
      await register({
        ...form,
        monthlyIncome: parseFloat(form.monthlyIncome) || 0,
      });
      toast.success('Account created! Welcome to FinanceAI 🎉');
      navigate('/chat');
    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.emailExists) {
        const msg = err.response?.data?.error || 'An account with this email already exists.';
        setExistingEmailError(msg);
        toast.error(msg);
      } else {
        const errors = err.response?.data?.errors;
        const msg = errors ? errors[0].msg : (err.response?.data?.error || 'Registration failed.');
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-surface-900 transition-colors">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle compact />
      </div>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900" />
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-brand-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-700 text-xl text-white">FinanceAI</span>
        </div>

        <div className="glass rounded-2xl p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-600 transition-all
                  ${step >= s ? 'bg-brand-600 text-white' : 'bg-surface-500 text-slate-500'}`}>
                  {s}
                </div>
                {s < 2 && <div className={`flex-1 h-0.5 w-16 ${step > s ? 'bg-brand-600' : 'bg-surface-400'}`} />}
              </div>
            ))}
            <span className="text-slate-500 text-xs ml-auto">Step {step} of 2</span>
          </div>

          {existingEmailError && (
            <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-amber-300">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{existingEmailError}</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login', { state: { email: form.email, message: 'Please enter your password to sign in.' } })}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold transition-all border border-amber-500/40"
              >
                Sign in with {form.email || 'this email'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {step === 1 ? (
            <>
              <h2 className="font-display font-700 text-2xl text-white mb-1">Create account</h2>
              <p className="text-slate-400 text-sm mb-6">Set up your login credentials</p>

              <form onSubmit={nextStep} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-name">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input id="reg-name" type="text" name="name" value={form.name} onChange={handleChange} required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white placeholder:text-slate-600 input-focus text-sm"
                      placeholder="John Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-email">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input id="reg-email" type="email" name="email" value={form.email} onChange={handleChange} required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white placeholder:text-slate-600 input-focus text-sm"
                      placeholder="you@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-password">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input id="reg-password" type={showPwd ? 'text' : 'password'} name="password" value={form.password}
                      onChange={handleChange} required minLength={6}
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white placeholder:text-slate-600 input-focus text-sm"
                      placeholder="At least 6 characters" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label="Toggle password visibility">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button id="register-next" type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-600 text-sm hover:from-brand-500 hover:to-brand-400 transition-all duration-200 mt-2">
                  Continue →
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-display font-700 text-2xl text-white mb-1">Financial Profile</h2>
              <p className="text-slate-400 text-sm mb-6">Help us personalize your AI experience</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-income">Monthly Income</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input id="reg-income" type="number" name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange}
                        className="w-full pl-9 pr-3 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white placeholder:text-slate-600 input-focus text-sm"
                        placeholder="5000" min="0" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-currency">Currency</label>
                    <select id="reg-currency" name="currency" value={form.currency} onChange={handleChange}
                      className="w-full px-3 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white input-focus text-sm appearance-none cursor-pointer">
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-goal">
                    <Target className="inline w-3.5 h-3.5 mr-1 text-brand-400" />
                    Financial Goal <span className="text-slate-600 font-normal">(optional)</span>
                  </label>
                  <textarea id="reg-goal" name="financialGoal" value={form.financialGoal} onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white placeholder:text-slate-600 input-focus text-sm resize-none"
                    placeholder="e.g. Save $50,000 for a house down payment in 3 years" />
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl border border-surface-400 text-slate-300 text-sm hover:bg-surface-600 transition-colors">
                    ← Back
                  </button>
                  <button id="register-submit" type="submit" disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-600 text-sm hover:from-brand-500 hover:to-brand-400 transition-all duration-200 disabled:opacity-50">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
