import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle({ className = '', compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className={`
        flex items-center gap-2 rounded-xl border transition-all duration-200
        ${compact ? 'p-2' : 'px-3 py-2 w-full justify-between'}
        ${
          isLight
            ? 'bg-surface-700/60 hover:bg-surface-700 border-surface-600 text-amber-600 hover:text-amber-700'
            : 'bg-surface-700/60 hover:bg-surface-700 border-surface-600 text-indigo-400 hover:text-indigo-300'
        }
        ${className}
      `}
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      <div className="flex items-center gap-2">
        {isLight ? (
          <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-400 transition-transform hover:-rotate-12" />
        )}
        {!compact && (
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {isLight ? 'Light Mode' : 'Dark Mode'}
          </span>
        )}
      </div>
      {!compact && (
        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-600/50 text-slate-500">
          Toggle
        </span>
      )}
    </button>
  );
}
