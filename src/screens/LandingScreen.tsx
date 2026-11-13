// Landing Home — the central hub of the app.
// Tappable logo at the top returns to the initial splash/onboarding page.
// Feature cards jump into each major area, and the bottom nav gives full
// page-to-page navigation. Acts as a "you are here" map of the app.

import { useState } from 'react';
import {
  Home, GitCompare, Briefcase, Info, BookOpen, ShieldAlert,
  Trophy, ArrowRight, TrendingUp, Users, Sparkles, ChevronRight, RotateCcw,
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { Logo } from '../components/Logo';
import { Flag } from '../components/Flag';
import { BottomNav } from '../components/BottomNav';
import { Button, Badge } from '../components/ui';
import type { Screen } from '../types';
import { dataService } from '../data';
import { useEffect } from 'react';
import type { League } from '../types';

interface Feature {
  key: Screen;
  title: string;
  desc: string;
  icon: typeof Trophy;
  tone: 'brand' | 'sky' | 'success' | 'warning' | 'accent' | 'neutral';
}

const features: Feature[] = [
  { key: 'league-home', title: 'Leagues & Clubs', desc: 'Browse NWSL standings, club prices & trade shares', icon: Trophy, tone: 'brand' },
  { key: 'compare', title: 'Compare Clubs', desc: 'Overlay price, squad value & position side-by-side', icon: GitCompare, tone: 'sky' },
  { key: 'portfolio', title: 'Your Portfolio', desc: 'Holdings, cash balance & gain/loss tracking', icon: Briefcase, tone: 'success' },
  { key: 'how-to-use', title: 'How to Use', desc: 'A 60-second guide to your first trade', icon: BookOpen, tone: 'warning' },
  { key: 'about', title: 'About futbolgirlx', desc: 'What this is and why we built it', icon: Info, tone: 'accent' },
  { key: 'disclaimer', title: 'Disclaimer', desc: 'Virtual game — not real securities', icon: ShieldAlert, tone: 'neutral' },
];

const toneClasses: Record<Feature['tone'], string> = {
  brand: 'bg-grad-brand-soft text-primary-600 dark:text-primary-400',
  sky: 'bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
  success: 'bg-success-100 dark:bg-success-500/10 text-success-600 dark:text-success-400',
  warning: 'bg-warning-100 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400',
  accent: 'bg-accent-100 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400',
  neutral: 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300',
};

export function LandingScreen() {
  const { navigate, portfolio, clubs } = useApp();
  const [leagues, setLeagues] = useState<League[]>([]);

  useEffect(() => { dataService.listLeagues().then(setLeagues); }, []);

  const liveLeagues = leagues.filter((l) => l.active);
  const soonLeagues = leagues.filter((l) => !l.active);
  const totalValue = portfolio.cash + portfolio.holdings.reduce((s, h) => {
    const e = h.kind === 'club' ? clubs.find((c) => c.id === h.refId) : undefined;
    return s + (e ? e.basePrice * h.shares : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 pb-20">
      {/* === Top bar with tappable logo -> initial splash page === */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-ink-950/90 backdrop-blur-lg border-b border-ink-200/70 dark:border-ink-800 safe-top">
        <div className="px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('splash')}
            className="tap tap-scale flex items-center gap-2.5"
            aria-label="Go to start page"
          >
            <Logo size={34} />
          </button>
          <button
            onClick={() => navigate('splash')}
            className="tap tap-scale inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 dark:text-ink-400 hover:text-primary-600 dark:hover:text-primary-400 px-2.5 py-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800"
            aria-label="Return to start"
          >
            <RotateCcw size={13} /> Start
          </button>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-5">
        {/* === Hero welcome === */}
        <section className="rounded-3xl p-5 bg-grad-brand text-white relative overflow-hidden shadow-card-lg">
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-secondary-400/20 blur-2xl" />
          <div className="relative">
            <p className="text-xs text-white/80 uppercase tracking-wider font-semibold">Welcome back to</p>
            <h1 className="font-display font-extrabold text-3xl mt-0.5">
              futbol<span className="text-white/90">girl</span><span className="text-secondary-200">x</span>
            </h1>
            <p className="text-sm text-white/90 mt-1.5 max-w-[16rem]">
              Trade shares in women's football clubs. Buy. Sell. Ride the scarcity.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('league-home')}
                className="bg-white text-primary-700 hover:bg-ink-50"
                rightIcon={<ArrowRight size={15} />}
              >
                Enter the market
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('how-to-use')}
                className="text-white border border-white/30 hover:bg-white/10"
              >
                How it works
              </Button>
            </div>
          </div>
        </section>

        {/* === Portfolio snapshot === */}
        <button
          onClick={() => navigate('portfolio')}
          className="tap tap-scale card w-full p-4 flex items-center gap-4 hover:border-primary-300 dark:hover:border-primary-700 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-grad-brand-soft flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-ink-400 uppercase font-semibold tracking-wide">Portfolio value</p>
            <p className="font-display font-extrabold text-xl tabular leading-tight">${totalValue.toFixed(2)}</p>
            <p className="text-[11px] text-ink-400">{portfolio.holdings.length} holdings · ${portfolio.cash.toFixed(0)} cash</p>
          </div>
          <ChevronRight size={18} className="text-ink-300" />
        </button>

        {/* === Leagues at a glance === */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="font-display font-bold text-sm flex items-center gap-2"><Trophy size={15} className="text-ink-400" /> Leagues</h2>
            <button onClick={() => navigate('league-home')} className="tap text-xs font-semibold text-primary-600 dark:text-primary-400">View all ›</button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
            {liveLeagues.map((l) => (
              <button
                key={l.id}
                onClick={() => navigate('league-home', { leagueId: l.id })}
                className="tap tap-scale card p-3 min-w-[140px] flex flex-col gap-2 hover:border-primary-300 dark:hover:border-primary-700"
              >
                <div className="flex items-center gap-2">
                  <Flag code={l.countryCode} size={28} />
                  <Badge tone="success">Live</Badge>
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">{l.shortName}</p>
                  <p className="text-[11px] text-ink-400 truncate">{l.country}</p>
                </div>
              </button>
            ))}
            {soonLeagues.slice(0, 5).map((l) => (
              <div key={l.id} className="card p-3 min-w-[140px] flex flex-col gap-2 opacity-60">
                <div className="flex items-center gap-2">
                  <Flag code={l.countryCode} size={28} />
                  <Badge tone="neutral">Soon</Badge>
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">{l.shortName}</p>
                  <p className="text-[11px] text-ink-400 truncate">{l.country}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* === Feature grid (placeholder buttons for each area) === */}
        <section>
          <h2 className="font-display font-bold text-sm flex items-center gap-2 mb-2.5">
            <Home size={15} className="text-ink-400" /> Explore
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.key}
                  onClick={() => navigate(f.key)}
                  className="tap tap-scale card p-3.5 flex flex-col gap-2.5 text-left hover:border-primary-300 dark:hover:border-primary-700"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneClasses[f.tone]}`}>
                    <Icon size={19} />
                  </div>
                  <div>
                    <p className="font-semibold text-[13px] leading-tight">{f.title}</p>
                    <p className="text-[11px] text-ink-400 mt-0.5 leading-snug">{f.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* === Stats strip === */}
        <section className="grid grid-cols-3 gap-2.5">
          <StatPill icon={Users} label="Clubs" value={String(clubs.length)} />
          <StatPill icon={Sparkles} label="Live leagues" value={String(liveLeagues.length)} />
          <StatPill icon={Trophy} label="Coming soon" value={String(soonLeagues.length)} />
        </section>

        <p className="text-[11px] text-ink-400 text-center pt-1">
          Tap the logo at the top anytime to return to the start page.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="card p-3 flex flex-col items-center text-center">
      <Icon size={16} className="text-ink-400 mb-1" />
      <p className="font-display font-extrabold text-lg tabular leading-none">{value}</p>
      <p className="text-[10px] text-ink-400 mt-0.5">{label}</p>
    </div>
  );
}
