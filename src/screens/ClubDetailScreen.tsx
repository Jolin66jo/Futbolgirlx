// Club Detail — Overview tab (chart, shares bar, stadium, fixtures, key players,
// valuation modal, BUY/SELL) + Analytics tab (5 reusable charts, Prompt 12).

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Info, MapPin, Calendar, Star, Flame, Building2, Users, GitCompare, BarChart3 } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { Shell, ScreenHeader } from '../components/Shell';
import { ClubLogo } from '../components/ClubLogo';
import { PriceChart } from '../components/PriceChart';
import { ProgressShareBar } from '../components/ProgressShareBar';
import { Button, Badge, ChangePill } from '../components/ui';
import { FooterNav } from '../components/BottomNav';
import { ValuationModal } from './ValuationModal';
import { TradeSheet } from './TradeSheet';
import { AnalyticsPanel } from '../components/Analytics';
import type { ClubAnalytics, TradeSide } from '../types';
import { computePrice, change24h } from '../lib/pricing';
import { dataService } from '../data';

export function ClubDetailScreen() {
  const { selectedClubId, getClub, navigate, portfolio } = useApp();
  const [valOpen, setValOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeSide, setTradeSide] = useState<TradeSide>('buy');
  const [tab, setTab] = useState<'overview' | 'analytics'>('overview');
  const [analytics, setAnalytics] = useState<ClubAnalytics | null>(null);

  const club = selectedClubId ? getClub(selectedClubId) : undefined;

  useEffect(() => {
    if (selectedClubId) dataService.getAnalytics(selectedClubId).then(setAnalytics);
  }, [selectedClubId]);

  if (!club) {
    return (
      <Shell>
        <ScreenHeader title="Club" onBack={() => navigate('league-home')} />
        <div className="p-8 text-center text-ink-400">Club not found.</div>
      </Shell>
    );
  }

  const price = computePrice(club);
  const ch = change24h(club.priceHistory);
  const holding = portfolio.holdings.find((h) => h.kind === 'club' && h.refId === club.id);

  const openTrade = (side: TradeSide) => { setTradeSide(side); setTradeOpen(true); };

  return (
    <Shell>
      <ScreenHeader
        title={club.shortName}
        subtitle={club.name}
        onBack={() => navigate('league-home')}
        right={
          <button onClick={() => navigate('compare', { clubId: club.id })} className="tap tap-scale p-1.5 rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Compare clubs">
            <GitCompare size={20} />
          </button>
        }
      />

      {/* tab switcher */}
      <div className="sticky top-14 z-20 bg-white/90 dark:bg-ink-950/90 backdrop-blur-lg px-4 pt-3 pb-2 border-b border-ink-100 dark:border-ink-800">
        <div className="flex gap-1 p-1 bg-ink-100 dark:bg-ink-800 rounded-xl">
          {(['overview', 'analytics'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tap tap-scale flex-1 h-9 rounded-lg text-sm font-semibold transition-colors inline-flex items-center justify-center gap-1.5 ${tab === t ? 'bg-white dark:bg-ink-900 text-primary-600 dark:text-primary-400 shadow-card' : 'text-ink-500'}`}
            >
              {t === 'overview' ? <><MapPin size={14} /> Overview</> : <><BarChart3 size={14} /> Analytics</>}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-32">
        {tab === 'overview' ? (
          <OverviewTab club={club} price={price} ch={ch} holding={holding} onValuation={() => setValOpen(true)} onPlayer={(id) => navigate('player-profile', { playerId: id, clubId: club.id })} />
        ) : (
          <AnalyticsTab club={club} analytics={analytics} />
        )}
        <FooterNav />
      </div>

      {/* fixed BUY/SELL bar */}
      <div className="fixed bottom-16 inset-x-0 z-30 px-4 pb-2">
        <div className="mx-auto max-w-md grid grid-cols-2 gap-2.5">
          <Button variant="success" size="lg" block leftIcon={<ArrowUp size={18} />} onClick={() => openTrade('buy')} className="shadow-card-lg">
            Buy
          </Button>
          <Button variant="danger" size="lg" block leftIcon={<ArrowDown size={18} />} onClick={() => openTrade('sell')} disabled={!holding} className="shadow-card-lg">
            Sell
          </Button>
        </div>
      </div>

      <ValuationModal open={valOpen} onClose={() => setValOpen(false)} />
      <TradeSheet open={tradeOpen} side={tradeSide} entity={club} onClose={() => setTradeOpen(false)} />
    </Shell>
  );
}

function OverviewTab({ club, price, ch, holding, onValuation, onPlayer }: {
  club: ReturnType<typeof useApp>['clubs'][number];
  price: number; ch: number; holding: ReturnType<typeof useApp>['portfolio']['holdings'][number] | undefined;
  onValuation: () => void; onPlayer: (id: string) => void;
}) {
  return (
    <>
      {/* hero price card */}
      <div
        className="rounded-3xl p-5 text-white relative overflow-hidden shadow-card"
        style={{ background: `linear-gradient(135deg, ${club.brandColor} 0%, ${club.brandColor2} 100%)` }}
      >
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-2">
            <ClubLogo abbr={club.abbr} color="#ffffff" color2="#ffffff" size={40} />
            <div>
              <p className="font-display font-extrabold text-xl leading-tight">{club.shortName}</p>
              <p className="text-xs text-white/80 flex items-center gap-1"><MapPin size={11} /> {club.city}</p>
            </div>
          </div>
          {holding && <Badge className="bg-white/20 text-white">{holding.shares} owned</Badge>}
        </div>
        <div className="relative mt-5 flex items-end justify-between">
          <div>
            <p className="text-xs text-white/80 uppercase tracking-wide font-semibold">Share price</p>
            <p className="font-display font-extrabold text-4xl tabular mt-0.5">${price.toFixed(2)}</p>
          </div>
          <ChangePill value={ch} className="bg-white/20 text-white" />
        </div>
      </div>

      {/* stadium / club info */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <InfoTile icon={Building2} label="Stadium" value={club.stadium} sub={`${club.stadiumCapacity.toLocaleString()} cap`} />
        <InfoTile icon={MapPin} label="Address" value={club.stadiumAddress} sub={`Est. ${club.foundedYear}`} />
        <InfoTile icon={Users} label="Avg attendance" value={club.avgAttendance.toLocaleString()} sub={`capacity ${Math.round((club.avgAttendance / club.stadiumCapacity) * 100)}%`} />
        <InfoTile icon={Calendar} label="Founded" value={String(club.foundedYear)} sub={`${new Date().getFullYear() - club.foundedYear} yrs old`} />
      </div>

      {/* price chart */}
      <div className="card mt-4 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-bold text-sm">Price history</h2>
          <span className="text-xs text-ink-400">last 30 days</span>
        </div>
        <PriceChart data={club.priceHistory} color={club.brandColor} height={180} />
      </div>

      {/* shares available */}
      <div className="card mt-4 p-4">
        <ProgressShareBar available={club.sharesAvailable} total={club.totalShares} />
      </div>

      {/* valuation link */}
      <button onClick={onValuation} className="tap tap-scale mt-4 w-full card p-4 flex items-center gap-3 hover:border-primary-300 dark:hover:border-primary-700 text-left">
        <div className="w-10 h-10 rounded-xl bg-grad-brand-soft flex items-center justify-center text-primary-600 dark:text-primary-400">
          <Info size={18} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">How is this valued?</p>
          <p className="text-xs text-ink-400">Performance, buzz, market & scarcity</p>
        </div>
        <span className="text-ink-400">›</span>
      </button>

      {/* buzz */}
      <div className="card mt-4 p-4 flex items-center gap-3">
        <Flame size={20} className="text-accent-500" />
        <div className="flex-1">
          <p className="text-xs text-ink-400 uppercase font-semibold tracking-wide">Fan buzz index</p>
          <div className="mt-1 h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
            <div className="h-full bg-grad-brand" style={{ width: `${club.buzz}%` }} />
          </div>
        </div>
        <span className="font-display font-extrabold text-lg tabular">{club.buzz}</span>
      </div>

      {/* fixtures */}
      <section className="mt-5">
        <h2 className="font-display font-bold text-sm flex items-center gap-2 mb-2.5">
          <Calendar size={15} className="text-ink-400" /> Upcoming fixtures
        </h2>
        <div className="space-y-2">
          {club.fixtures.map((f) => (
            <div key={f.id} className="card p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-ink-100 dark:bg-ink-800 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-ink-400 uppercase">{new Date(f.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                <span className="font-display font-extrabold text-sm leading-none">{new Date(f.date).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{f.home ? 'vs' : '@'} {f.opponent}</p>
                <p className="text-xs text-ink-400">{f.competition} · {f.home ? 'Home' : 'Away'}</p>
              </div>
              <Badge tone={f.home ? 'brand' : 'sky'}>{f.home ? 'H' : 'A'}</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* key players — tappable */}
      <section className="mt-5">
        <h2 className="font-display font-bold text-sm flex items-center gap-2 mb-2.5">
          <Star size={15} className="text-ink-400" /> Key players <span className="text-ink-400 font-normal text-xs">tap to view & trade</span>
        </h2>
        <div className="space-y-2">
          {club.keyPlayers.map((p) => (
            <button
              key={p.id}
              onClick={() => onPlayer(p.id)}
              className="tap tap-scale w-full card p-3 flex items-center gap-3 hover:border-primary-300 dark:hover:border-primary-700 text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-grad-brand-soft flex items-center justify-center font-display font-extrabold text-primary-600 dark:text-primary-400 text-sm tabular shrink-0">
                {p.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{p.name}</p>
                <p className="text-xs text-ink-400">{p.position} · tap for profile</p>
              </div>
              <div className="flex items-center gap-1 text-ink-600 dark:text-ink-300">
                <Star size={13} className="text-warning-400 fill-warning-400" />
                <span className="font-bold tabular text-sm">{p.rating.toFixed(1)}</span>
              </div>
              <span className="text-ink-300">›</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function AnalyticsTab({ club, analytics }: { club: ReturnType<typeof useApp>['clubs'][number]; analytics: ClubAnalytics | null }) {
  if (!analytics) return <div className="card p-8 text-center text-sm text-ink-400">Loading analytics…</div>;
  return (
    <>
      <p className="text-xs text-ink-500 dark:text-ink-400 mb-3">
        Five-year trends for <span className="font-semibold">{club.shortName}</span>. Historical data is mock for now — the backfill script (Prompt 11) will populate real API-Football + Wikipedia data with provenance.
      </p>
      <AnalyticsPanel analytics={analytics} />
    </>
  );
}

function InfoTile({ icon: Icon, label, value, sub }: { icon: typeof MapPin; label: string; value: string; sub?: string }) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-1.5 text-ink-400 mb-1">
        <Icon size={12} />
        <span className="text-[10px] uppercase font-semibold tracking-wide">{label}</span>
      </div>
      <p className="font-semibold text-[13px] leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-ink-400 mt-0.5">{sub}</p>}
    </div>
  );
}
