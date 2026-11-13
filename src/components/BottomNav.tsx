// Bottom navigation bar — shown on all main app screens.

import { Home, Briefcase, Info, Moon, Sun, GitCompare, LayoutGrid } from 'lucide-react';
import { useApp } from '../state/AppContext';
import type { Screen } from '../types';
import { LogoMark } from './Logo';

export function BottomNav() {
  const { screen, navigate, dark, toggleDark } = useApp();
  const items: { key: Screen; label: string; icon: typeof Home }[] = [
    { key: 'landing', label: 'Home', icon: LayoutGrid },
    { key: 'league-home', label: 'League', icon: Home },
    { key: 'compare', label: 'Compare', icon: GitCompare },
    { key: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { key: 'about', label: 'About', icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-ink-200/70 dark:border-ink-800 bg-white/90 dark:bg-ink-950/90 backdrop-blur-lg safe-bottom">
      <div className="mx-auto max-w-md px-2 h-16 flex items-stretch">
        {items.map((it) => {
          const active = screen === it.key || (it.key === 'league-home' && (screen === 'club-detail' || screen === 'player-profile')) || (it.key === 'landing' && screen === 'splash');
          const Icon = it.icon;
          return (
            <button
              key={it.key}
              onClick={() => navigate(it.key)}
              className="tap tap-scale flex-1 flex flex-col items-center justify-center gap-0.5 relative"
              aria-current={active ? 'page' : undefined}
            >
              {active && <span className="absolute -top-px h-0.5 w-8 rounded-full bg-primary-500" />}
              <Icon size={22} className={active ? 'text-primary-500' : 'text-ink-400'} />
              <span className={`text-[11px] font-semibold ${active ? 'text-primary-600 dark:text-primary-400' : 'text-ink-400'}`}>{it.label}</span>
            </button>
          );
        })}
        <button
          onClick={toggleDark}
          className="tap tap-scale w-12 flex flex-col items-center justify-center gap-0.5"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={22} className="text-secondary-400" /> : <Moon size={22} className="text-ink-400" />}
          <span className="text-[11px] font-semibold text-ink-400">{dark ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </nav>
  );
}

export function FooterNav() {
  const { navigate } = useApp();
  return (
    <footer className="mt-8 border-t border-ink-200/70 dark:border-ink-800 pt-6 pb-24 px-5">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('landing')} className="tap tap-scale flex items-center gap-2" aria-label="Go to home">
          <LogoMark size={26} />
          <span className="font-display font-extrabold text-sm">
            <span className="text-gradient">futbol</span>
            <span className="text-ink-900 dark:text-white">girl</span>
            <span className="text-secondary-500">x</span>
          </span>
        </button>
      </div>
      <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <button className="tap text-ink-500 hover:text-primary-600 dark:text-ink-400 dark:hover:text-primary-400" onClick={() => navigate('landing')}>Home</button>
        <button className="tap text-ink-500 hover:text-primary-600 dark:text-ink-400 dark:hover:text-primary-400" onClick={() => navigate('about')}>About</button>
        <button className="tap text-ink-500 hover:text-primary-600 dark:text-ink-400 dark:hover:text-primary-400" onClick={() => navigate('how-to-use')}>How to Use</button>
        <button className="tap text-ink-500 hover:text-primary-600 dark:text-ink-400 dark:hover:text-primary-400" onClick={() => navigate('disclaimer')}>Disclaimer</button>
        <button className="tap text-ink-500 hover:text-primary-600 dark:text-ink-400 dark:hover:text-primary-400" onClick={() => navigate('league-home')}>League</button>
        <button className="tap text-ink-500 hover:text-primary-600 dark:text-ink-400 dark:hover:text-primary-400" onClick={() => navigate('portfolio')}>Portfolio</button>
        <button className="tap text-ink-500 hover:text-primary-600 dark:text-ink-400 dark:hover:text-primary-400" onClick={() => navigate('compare')}>Compare</button>
      </nav>
      <p className="mt-4 text-xs text-ink-400">© {new Date().getFullYear()} futbolgirlx. Not real securities. For entertainment only.</p>
    </footer>
  );
}
