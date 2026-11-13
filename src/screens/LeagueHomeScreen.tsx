// League Home — NWSL standings table + scrollable club cards list.

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { dataService } from '../data';
import type { Club, League } from '../types';
import { Shell, ScreenHeader } from '../components/Shell';
import { ClubCard } from '../components/ClubCard';
import { ClubLogo } from '../components/ClubLogo';
import { ChangePill, Badge } from '../components/ui';
import { computePrice, change24h } from '../lib/pricing';
import { FooterNav } from '../components/BottomNav';
import { Flag } from '../components/Flag';

export function LeagueHomeScreen() {
  const { clubs, navigate, selectedLeagueId } = useApp();
  const [league, setLeague] = useState<League | null>(null);
  const [tab, setTab] = useState<'standings' | 'market'>('standings');
  const [query, setQuery] = useState('');
  const [leagueOpen, setLeagueOpen] = useState(false);

  useEffect(() => {
    dataService.listLeagues().then((ls) => setLeague(ls.find((l) => l.id === selectedLeagueId) ?? ls[0] ?? null));
  }, [selectedLeagueId]);

  const sorted = useMemo(() => {
    const list = clubs.filter((c) => c.leagueId === selectedLeagueId);
    return [...list].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  }, [clubs, selectedLeagueId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return sorted;
    const q = query.toLowerCase();
    return sorted.filter((c) => c.name.toLowerCase().includes(q) || c.shortName.toLowerCase().includes(q) || c.abbr.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
  }, [sorted, query]);

  return (
    <Shell>
      <ScreenHeader
        title={
          <span className="inline-flex items-center gap-2">
            {league && <Flag code={league.countryCode} size={20} />}
            <span>{league?.shortName ?? 'NWSL'}</span>
          </span>
        }
        subtitle={league?.name}
        right={
          <button onClick={() => setLeagueOpen((v) => !v)} className="tap tap-scale p-1.5 rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Change league">
            <ChevronDown size={20} className={`transition-transform ${leagueOpen ? 'rotate-180' : ''}`} />
          </button>
        }
      />

      {leagueOpen && <LeagueSwitcher onClose={() => setLeagueOpen(false)} />}

      <div className="sticky top-14 z-20 bg-white/90 dark:bg-ink-950/90 backdrop-blur-lg px-4 pt-3 pb-2">
        <div className="flex gap-1 p-1 bg-ink-100 dark:bg-ink-800 rounded-xl">
          {(['standings', 'market'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tap tap-scale flex-1 h-9 rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'bg-white dark:bg-ink-900 text-primary-600 dark:text-primary-400 shadow-card' : 'text-ink-500'}`}
            >
              {t === 'standings' ? 'Standings' : 'Market'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 pb-24">
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs…"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-ink-100 dark:bg-ink-800 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        {tab === 'standings' ? (
          <StandingsTable clubs={filtered} onPick={(id) => navigate('club-detail', { clubId: id })} />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((c, i) => <ClubCard key={c.id} club={c} index={i} />)}
            {filtered.length === 0 && <EmptyState />}
          </div>
        )}

        <FooterNav />
      </div>
    </Shell>
  );
}

function StandingsTable({ clubs, onPick }: { clubs: Club[]; onPick: (id: string) => void }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100 dark:border-ink-800">
            <th className="text-left font-semibold px-3 py-2.5">#</th>
            <th className="text-left font-semibold px-1 py-2.5">Club</th>
            <th className="text-center font-semibold px-1 py-2.5">P</th>
            <th className="text-center font-semibold px-1 py-2.5 hidden xs:table-cell">GD</th>
            <th className="text-center font-semibold px-1 py-2.5">Pts</th>
            <th className="text-right font-semibold px-2 py-2.5">Price</th>
            <th className="text-right font-semibold px-3 py-2.5">24h</th>
          </tr>
        </thead>
        <tbody>
          {clubs.map((c, i) => {
            const price = computePrice(c);
            const ch = change24h(c.priceHistory);
            return (
              <tr
                key={c.id}
                onClick={() => onPick(c.id)}
                className="tap tap-scale border-b border-ink-50 dark:border-ink-800/60 last:border-0 hover:bg-ink-50 dark:hover:bg-ink-800/40 cursor-pointer"
              >
                <td className="px-3 py-2.5 tabular text-ink-400 font-bold">{i + 1}</td>
                <td className="px-1 py-2">
                  <div className="flex items-center gap-2">
                    <ClubLogo abbr={c.abbr} color={c.brandColor} color2={c.brandColor2} size={26} />
                    <div className="min-w-0">
                      <p className="font-semibold text-[13px] truncate leading-tight">{c.shortName}</p>
                      <p className="text-[10px] text-ink-400 truncate">{c.abbr}</p>
                    </div>
                  </div>
                </td>
                <td className="text-center tabular text-ink-600 dark:text-ink-300">{c.played}</td>
                <td className="text-center tabular text-ink-600 dark:text-ink-300 hidden xs:table-cell">{c.goalsFor - c.goalsAgainst > 0 ? '+' : ''}{c.goalsFor - c.goalsAgainst}</td>
                <td className="text-center tabular font-bold">{c.points}</td>
                <td className="text-right tabular font-semibold">${price.toFixed(2)}</td>
                <td className="pr-3 text-right"><ChangePill value={ch} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {clubs.length === 0 && <div className="p-6 text-center text-sm text-ink-400">No clubs match your search.</div>}
    </div>
  );
}

function LeagueSwitcher({ onClose }: { onClose: () => void }) {
  const { navigate, selectedLeagueId } = useApp();
  const [leagues, setLeagues] = useState<League[]>([]);
  useEffect(() => { dataService.listLeagues().then(setLeagues); }, []);
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute top-14 right-3 z-30 w-64 card p-2 animate-scale-in shadow-card-lg">
        {leagues.map((l) => (
          <button
            key={l.id}
            disabled={!l.active}
            onClick={() => { if (l.active) { navigate('league-home', { leagueId: l.id }); onClose(); } }}
            className={`tap tap-scale w-full flex items-center gap-3 p-2.5 rounded-xl text-left ${l.active ? 'hover:bg-ink-100 dark:hover:bg-ink-800' : 'opacity-50 cursor-not-allowed'} ${selectedLeagueId === l.id ? 'bg-ink-100 dark:bg-ink-800' : ''}`}
          >
            <Flag code={l.countryCode} size={28} />
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold truncate">{l.shortName}</span>
              <span className="block text-[10px] text-ink-400 truncate">{l.country}</span>
            </span>
            {l.active ? <Badge tone="success">Live</Badge> : <Badge tone="neutral">Soon</Badge>}
          </button>
        ))}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="card p-8 text-center">
      <p className="text-sm text-ink-400">No clubs found.</p>
    </div>
  );
}
