// Portfolio — cash balance, holdings list (clubs AND players) with current
// value + gain/loss, and total portfolio value at the top.
// Generalized in Prompt 10 to show both kinds of holdings.

import { Wallet, TrendingUp, TrendingDown, ArrowRight, User } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { Shell, ScreenHeader } from '../components/Shell';
import { ClubLogo } from '../components/ClubLogo';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Button, Badge, ChangePill } from '../components/ui';
import { FooterNav } from '../components/BottomNav';
import { computePrice } from '../lib/pricing';
import type { Club, Holding, Player } from '../types';

interface Row {
  h: Holding;
  club?: Club;
  player?: Player;
  name: string;
  abbr: string;
  c1: string;
  c2: string;
  cur: number;
  value: number;
  cost: number;
  gain: number;
  gainPct: number;
  kind: 'club' | 'player';
  refId: string;
}

export function PortfolioScreen() {
  const { portfolio, getClub, getPlayer, navigate } = useApp();

  const rows: Row[] = portfolio.holdings.map((h) => {
    if (h.kind === 'club') {
      const club = getClub(h.refId);
      if (!club) return null as unknown as Row;
      const cur = computePrice(club);
      const value = cur * h.shares;
      const cost = h.avgBuyPrice * h.shares;
      return { h, club, name: club.shortName, abbr: club.abbr, c1: club.brandColor, c2: club.brandColor2, cur, value, cost, gain: value - cost, gainPct: cost > 0 ? ((value - cost) / cost) * 100 : 0, kind: 'club', refId: h.refId };
    }
    const player = getPlayer(h.refId);
    if (!player) return null as unknown as Row;
    const cur = computePrice(player);
    const value = cur * h.shares;
    const cost = h.avgBuyPrice * h.shares;
    return { h, player, name: player.name, abbr: player.abbr, c1: player.brandColor, c2: player.brandColor2, cur, value, cost, gain: value - cost, gainPct: cost > 0 ? ((value - cost) / cost) * 100 : 0, kind: 'player', refId: h.refId };
  }).filter(Boolean) as Row[];

  const holdingsValue = rows.reduce((s, r) => s + r.value, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalValue = portfolio.cash + holdingsValue;
  const totalGain = holdingsValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const up = totalGain >= 0;

  const clubCount = rows.filter((r) => r.kind === 'club').length;
  const playerCount = rows.filter((r) => r.kind === 'player').length;

  return (
    <Shell>
      <ScreenHeader title="Portfolio" subtitle="Your holdings & cash" />
      <div className="px-4 pt-4 pb-24">
        {/* total value hero */}
        <div className="rounded-3xl p-5 bg-grad-brand text-white relative overflow-hidden shadow-card-lg">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <p className="text-xs text-white/80 uppercase tracking-wide font-semibold">Total portfolio value</p>
          <p className="font-display font-extrabold text-4xl tabular mt-1">${totalValue.toFixed(2)}</p>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1 font-semibold">
              {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {up ? '+' : ''}{totalGain.toFixed(2)} ({totalGainPct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* cash + holdings summary */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="card p-3">
            <p className="text-[10px] text-ink-400 uppercase font-semibold tracking-wide">Cash</p>
            <p className="font-display font-extrabold text-base tabular mt-0.5">${portfolio.cash.toFixed(0)}</p>
          </div>
          <div className="card p-3">
            <p className="text-[10px] text-ink-400 uppercase font-semibold tracking-wide">Clubs</p>
            <p className="font-display font-extrabold text-base tabular mt-0.5">{clubCount}</p>
          </div>
          <div className="card p-3">
            <p className="text-[10px] text-ink-400 uppercase font-semibold tracking-wide">Players</p>
            <p className="font-display font-extrabold text-base tabular mt-0.5">{playerCount}</p>
          </div>
        </div>

        {/* holdings */}
        <h2 className="font-display font-bold text-sm mt-5 mb-2.5 flex items-center gap-2">
          <Wallet size={15} className="text-ink-400" /> Your holdings
          <span className="text-ink-400 font-normal">({rows.length})</span>
        </h2>

        {rows.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-grad-brand-soft mx-auto flex items-center justify-center text-primary-500 mb-3">
              <Wallet size={22} />
            </div>
            <p className="font-semibold text-sm">No holdings yet</p>
            <p className="text-xs text-ink-400 mt-1 mb-4">Buy your first shares to start your portfolio.</p>
            <Button size="sm" onClick={() => navigate('league-home')} rightIcon={<ArrowRight size={16} />}>Browse clubs</Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {rows.map((r) => {
              const rowUp = r.gain >= 0;
              const go = () => r.kind === 'club'
                ? navigate('club-detail', { clubId: r.refId })
                : navigate('player-profile', { playerId: r.refId, clubId: r.player?.clubId });
              return (
                <button
                  key={`${r.kind}-${r.refId}`}
                  onClick={go}
                  className="tap tap-scale card w-full text-left p-3.5 flex items-center gap-3.5 hover:border-primary-300 dark:hover:border-primary-700"
                >
                  {r.kind === 'club'
                    ? <ClubLogo abbr={r.abbr} color={r.c1} color2={r.c2} size={42} />
                    : (r.player ? <PlayerAvatar player={r.player} size={42} /> : <div className="w-[42px] h-[42px] rounded-full bg-ink-100 flex items-center justify-center"><User size={20} className="text-ink-400" /></div>)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{r.name}</p>
                      <Badge tone={r.kind === 'player' ? 'sky' : 'brand'}>{r.kind}</Badge>
                      <Badge tone="neutral">{r.h.shares} sh</Badge>
                    </div>
                    <p className="text-xs text-ink-400 tabular">avg ${r.h.avgBuyPrice.toFixed(2)} · now ${r.cur.toFixed(2)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`font-bold tabular text-sm ${rowUp ? 'text-success-600' : 'text-error-600'}`}>
                        {rowUp ? '+' : ''}{r.gain.toFixed(2)}
                      </span>
                      <ChangePill value={r.gainPct} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-400">Value</p>
                    <p className="font-display font-extrabold tabular">${r.value.toFixed(2)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <FooterNav />
      </div>
    </Shell>
  );
}
