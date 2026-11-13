// Player Profile (Prompt 9) — reachable by tapping a player name from Club Detail.
// Photo (initials avatar), name, position, age, club, current-season stats
// (goals, assists, minutes), price history chart, shares-available indicator,
// and BUY/SELL reusing the shared TradeSheet.

import { useState } from 'react';
import { ArrowDown, ArrowUp, Info, MapPin, Goal, Handshake, Clock, Grid3x3, Flame, ChevronRight } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { Shell, ScreenHeader } from '../components/Shell';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { PriceChart } from '../components/PriceChart';
import { ProgressShareBar } from '../components/ProgressShareBar';
import { Button, Badge, ChangePill } from '../components/ui';
import { ValuationModal } from './ValuationModal';
import { TradeSheet } from './TradeSheet';
import type { TradeSide } from '../types';
import { computePrice, change24h } from '../lib/pricing';

export function PlayerProfileScreen() {
  const { selectedPlayerId, getPlayer, getClub, navigate } = useApp();
  const [valOpen, setValOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeSide, setTradeSide] = useState<TradeSide>('buy');

  const player = selectedPlayerId ? getPlayer(selectedPlayerId) : undefined;
  if (!player) {
    return (
      <Shell>
        <ScreenHeader title="Player" onBack={() => navigate('club-detail')} />
        <div className="p-8 text-center text-ink-400">Player not found.</div>
      </Shell>
    );
  }

  const club = getClub(player.clubId);
  const price = computePrice(player);
  const ch = change24h(player.priceHistory);

  const openTrade = (side: TradeSide) => { setTradeSide(side); setTradeOpen(true); };

  const stats = [
    { icon: Goal, label: 'Goals', value: player.goals },
    { icon: Handshake, label: 'Assists', value: player.assists },
    { icon: Grid3x3, label: 'Apps', value: player.appearances },
    { icon: Clock, label: 'Minutes', value: player.minutes },
  ];

  return (
    <Shell>
      <ScreenHeader
        title={player.shortName}
        subtitle={player.name}
        onBack={() => navigate('club-detail', { clubId: player.clubId })}
        right={<PlayerAvatar player={player} size={32} ring />}
      />

      <div className="px-4 pt-4 pb-32">
        {/* hero card */}
        <div
          className="rounded-3xl p-5 text-white relative overflow-hidden shadow-card"
          style={{ background: `linear-gradient(135deg, ${player.brandColor} 0%, ${player.brandColor2} 100%)` }}
        >
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <PlayerAvatar player={player} size={64} ring />
            <div className="flex-1 min-w-0">
              <p className="font-display font-extrabold text-xl leading-tight">{player.name}</p>
              <p className="text-xs text-white/85 flex items-center gap-1.5 mt-0.5">
                <Badge className="bg-white/20 text-white">#{player.number} {player.position}</Badge>
                <span>{player.age} yrs</span>
                <span className="opacity-60">·</span>
                <span>{player.nationality}</span>
              </p>
              {club && (
                <button
                  onClick={() => navigate('club-detail', { clubId: club.id })}
                  className="tap mt-2 inline-flex items-center gap-1 text-xs text-white/90 hover:text-white bg-white/10 rounded-lg px-2 py-1"
                >
                  <MapPin size={11} /> {club.shortName} <ChevronRight size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="relative mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs text-white/80 uppercase tracking-wide font-semibold">Share price</p>
              <p className="font-display font-extrabold text-3xl tabular mt-0.5">${price.toFixed(2)}</p>
            </div>
            <ChangePill value={ch} className="bg-white/20 text-white" />
          </div>
        </div>

        {/* season stats */}
        <div className="mt-4">
          <h2 className="font-display font-bold text-sm mb-2.5 flex items-center justify-between">
            <span>{player.season} season</span>
            <span className="text-xs text-ink-400 font-normal">current</span>
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card p-2.5 text-center">
                  <Icon size={16} className="mx-auto text-primary-500 mb-1" />
                  <p className="font-display font-extrabold text-lg tabular leading-none">{s.value}</p>
                  <p className="text-[10px] text-ink-400 mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* price chart */}
        <div className="card mt-4 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-bold text-sm">Price history</h2>
            <span className="text-xs text-ink-400">last 30 days</span>
          </div>
          <PriceChart data={player.priceHistory} color={player.brandColor} height={170} />
        </div>

        {/* shares available */}
        <div className="card mt-4 p-4">
          <ProgressShareBar available={player.sharesAvailable} total={player.totalShares} />
        </div>

        {/* valuation link */}
        <button
          onClick={() => setValOpen(true)}
          className="tap tap-scale mt-4 w-full card p-4 flex items-center gap-3 hover:border-primary-300 dark:hover:border-primary-700 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-grad-brand-soft flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Info size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">How is this valued?</p>
            <p className="text-xs text-ink-400">Performance, buzz & scarcity — same model as clubs</p>
          </div>
          <span className="text-ink-400">›</span>
        </button>

        {/* buzz */}
        <div className="card mt-4 p-4 flex items-center gap-3">
          <Flame size={20} className="text-accent-500" />
          <div className="flex-1">
            <p className="text-xs text-ink-400 uppercase font-semibold tracking-wide">Player buzz index</p>
            <div className="mt-1 h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
              <div className="h-full bg-grad-brand" style={{ width: `${player.buzz}%` }} />
            </div>
          </div>
          <span className="font-display font-extrabold text-lg tabular">{player.buzz}</span>
        </div>

        {/* holdings note */}
        <PlayerHoldingNote playerId={player.id} />
      </div>

      {/* fixed BUY/SELL bar */}
      <div className="fixed bottom-16 inset-x-0 z-30 px-4 pb-2">
        <div className="mx-auto max-w-md grid grid-cols-2 gap-2.5">
          <Button variant="success" size="lg" block leftIcon={<ArrowUp size={18} />} onClick={() => openTrade('buy')} className="shadow-card-lg">
            Buy
          </Button>
          <Button variant="danger" size="lg" block leftIcon={<ArrowDown size={18} />} onClick={() => openTrade('sell')} className="shadow-card-lg">
            Sell
          </Button>
        </div>
      </div>

      <ValuationModal open={valOpen} onClose={() => setValOpen(false)} />
      <TradeSheet open={tradeOpen} side={tradeSide} entity={player} onClose={() => setTradeOpen(false)} />
    </Shell>
  );
}

function PlayerHoldingNote({ playerId }: { playerId: string }) {
  const { portfolio, navigate } = useApp();
  const h = portfolio.holdings.find((x) => x.kind === 'player' && x.refId === playerId);
  if (!h) return null;
  return (
    <div className="mt-4 card p-3.5 flex items-center justify-between">
      <p className="text-sm">
        You own <span className="font-bold">{h.shares} shares</span> @ avg ${h.avgBuyPrice.toFixed(2)}
      </p>
      <button onClick={() => navigate('portfolio')} className="tap text-xs font-semibold text-primary-600 dark:text-primary-400">
        View portfolio ›
      </button>
    </div>
  );
}
