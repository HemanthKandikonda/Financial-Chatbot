import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import {
  MessageSquare, Settings, User, LogOut, Sparkles,
  ChevronLeft, ChevronRight, Menu, X, Landmark, PieChart
} from 'lucide-react';

const navItems = [
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/budget', icon: PieChart, label: 'Budget & Charts' },
  { to: '/savings', icon: Landmark, label: 'Savings & Rates' },
  { to: '/settings', icon: Settings, label: 'AI Settings' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-surface-600 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-700 text-slate-800 dark:text-white text-base">FinanceAI</span>
        )}
      </div>

      {/* Children (chat list, etc.) */}
      {children && !collapsed && (
        <div className="flex-1 overflow-y-auto border-b border-surface-600 py-2">
          {children}
        </div>
      )}

      {/* Nav */}
      <nav className={`px-2 py-3 space-y-0.5 ${children && !collapsed ? '' : 'flex-1'}`}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                isActive
                  ? 'bg-brand-600/20 border border-brand-500/30 text-brand-600 dark:text-white font-medium'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-surface-700 dark:hover:bg-surface-600 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info, theme toggle + collapse */}
      <div className="px-2 pb-4 pt-2 border-t border-surface-600 space-y-2">
        <ThemeToggle compact={collapsed} />

        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-700/50">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center text-xs font-700 text-white flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-800 dark:text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          id="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-surface-700/60 dark:hover:bg-surface-600 text-xs transition-all"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden w-9 h-9 rounded-xl bg-surface-700 border border-surface-500 flex items-center justify-center text-slate-300"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          bg-surface-800 border-r border-surface-600 flex-shrink-0 sidebar overflow-hidden
          fixed lg:relative inset-y-0 left-0 z-40
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
