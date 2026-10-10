import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authAPI } from '../services/api.js';
import { toast } from 'react-hot-toast';
import { User, Mail, DollarSign, Target, Lock, Save, LogOut } from 'lucide-react';
import Sidebar from '../layouts/Sidebar.jsx';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'USD',
    monthlyIncome: user?.monthlyIncome || '',
    financialGoal: user?.financialGoal || '',
  });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileChange = (e) =>
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        ...profileForm,
        monthlyIncome: parseFloat(profileForm.monthlyIncome) || 0,
      });
      updateUser(res.data.user);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed! 🔒');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-surface-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display font-700 text-2xl text-white">Account Settings</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage your profile and security</p>
            </div>
            <button
              id="logout-btn"
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>

          {/* Avatar card */}
          <div className="glass rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center text-2xl font-700 text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-display font-600 text-white text-lg">{user?.name}</p>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <p className="text-brand-400 text-xs mt-0.5">
                {user?.currency} · {user?.monthlyIncome ? `${user.currency} ${Number(user.monthlyIncome).toLocaleString()}/mo` : 'Income not set'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-800 p-1 rounded-xl mb-6 border border-surface-600">
            {[
              { key: 'profile', label: 'Profile', icon: User },
              { key: 'security', label: 'Security', icon: Lock },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                id={`profile-tab-${key}`}
                onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === key ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Profile form */}
          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="glass rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="profile-name">
                  <User className="inline w-3.5 h-3.5 mr-1 text-brand-400" />
                  Full Name
                </label>
                <input id="profile-name" type="text" name="name" value={profileForm.name}
                  onChange={handleProfileChange} required
                  className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white input-focus text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="profile-income">
                    <DollarSign className="inline w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Monthly Income
                  </label>
                  <input id="profile-income" type="number" name="monthlyIncome" value={profileForm.monthlyIncome}
                    onChange={handleProfileChange} min="0"
                    className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white input-focus text-sm"
                    placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="profile-currency">Currency</label>
                  <select id="profile-currency" name="currency" value={profileForm.currency}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white input-focus text-sm appearance-none cursor-pointer">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="profile-goal">
                  <Target className="inline w-3.5 h-3.5 mr-1 text-violet-400" />
                  Financial Goal
                </label>
                <textarea id="profile-goal" name="financialGoal" value={profileForm.financialGoal}
                  onChange={handleProfileChange} rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white input-focus text-sm resize-none"
                  placeholder="Describe your financial goals..." />
              </div>

              <button id="save-profile-btn" type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Security form */}
          {tab === 'security' && (
            <form onSubmit={changePassword} className="glass rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="current-pwd">Current Password</label>
                <input id="current-pwd" type="password" value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} required
                  className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white input-focus text-sm"
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="new-pwd">New Password</label>
                <input id="new-pwd" type="password" value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} required minLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white input-focus text-sm"
                  placeholder="At least 6 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="confirm-pwd">Confirm Password</label>
                <input id="confirm-pwd" type="password" value={pwdForm.confirm}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} required
                  className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-400 text-white input-focus text-sm"
                  placeholder="Re-enter new password" />
              </div>
              <button id="change-pwd-btn" type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all disabled:opacity-50">
                <Lock className="w-4 h-4" />
                {saving ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
