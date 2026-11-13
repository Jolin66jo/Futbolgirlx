// Onboarding step 3 — choose a league. NWSL active; others "Coming Soon".

import { Check, Lock, ChevronRight, FlagOff } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { Button, Badge } from '../components/ui';
import { Flag } from '../components/Flag';
import { dataService } from '../data';
import type { League } from '../types';
import { useEffect, useState } from 'react';

export function ChooseLeagueScreen() {
  const { navigate, completeOnboarding, selectedLeagueId } = useApp();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selected, setSelected] = useState<string>(selectedLeagueId);

  useEffect(() => { dataService.listLeagues().then(setLeagues); }, []);

  const continueToHome = () => {
    completeOnboarding();
    navigate('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-50 dark:bg-ink-950">
      <header className="safe-top px-5 pt-6 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">Step 3 of 3</p>
        <h1 className="font-display font-extrabold text-2xl mt-1">Choose your league</h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">More leagues coming soon. Start with the NWSL.</p>
      </header>

      <div className="flex-1 px-5 pt-2 space-y-3 overflow-y-auto pb-28">
        {leagues.map((l) => {
          const isSelected = selected === l.id;
          return (
            <button
              key={l.id}
              disabled={!l.active}
              onClick={() => l.active && setSelected(l.id)}
              className={`tap tap-scale card p-4 flex items-center gap-4 transition-all w-full text-left ${l.active ? '' : 'opacity-60'} ${isSelected ? 'ring-2 ring-primary-500 shadow-glow' : ''} ${l.active ? 'hover:border-primary-300 dark:hover:border-primary-700' : 'cursor-not-allowed'}`}
            >
              {/* flag + accent bar */}
              <div className="relative shrink-0">
                <Flag code={l.countryCode} size={42} />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-ink-900" style={{ background: l.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{l.shortName}</p>
                  {l.active
                    ? <Badge tone="success">Live</Badge>
                    : <Badge tone="neutral"><Lock size={10} /> Soon</Badge>}
                  {!l.active && l.seasonStatus === 'finished' && (
                    <Badge tone="warning">2024 final</Badge>
                  )}
                </div>
                <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{l.name}</p>
                <p className="text-[11px] text-ink-400 truncate mt-0.5">{l.blurb}</p>
              </div>
              {isSelected && l.active && (
                <span className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0">
                  <Check size={16} />
                </span>
              )}
              {!l.active && (
                <span className="text-ink-300 shrink-0"><FlagOff size={16} /></span>
              )}
            </button>
          );
        })}

        <p className="text-[11px] text-ink-400 text-center pt-2 leading-relaxed px-4">
          Coming-soon leagues are seeded from their most recent final standings. Once a league goes live, prices will update with live performance & buzz.
        </p>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-ink-950/90 backdrop-blur-lg border-t border-ink-200/70 dark:border-ink-800 safe-bottom px-5 py-3">
        <div className="mx-auto max-w-md">
          <Button block size="lg" onClick={continueToHome} rightIcon={<ChevronRight size={18} />}>
            Enter futbolgirlx
          </Button>
        </div>
      </div>
    </div>
  );
}
