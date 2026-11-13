// Compare Clubs (Prompt 13) — pick two clubs, overlay price history, squad value,
// and league position for direct comparison. Financial-comparison styling.

import { useMemo, useState } from 'react';
import { ChevronDown, Check, TrendingUp, BarChart3, MapPin } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { Shell, ScreenHeader } from '../components/Shell';
import { ClubLogo } from '../components/ClubLogo';
import { CompareOverlay } from '../components/CompareOverlay';
import { FooterNav } from '../components/BottomNav';
import { ChangePill } from '../components/ui';
import { computePrice, change24h } from '../lib/pricing';
import { MOCK_ANALYTICS } from '../data';

export function CompareScreen() {
  const { clubs, selectedClubId, navigate } = useApp();
  const allClubs = useMemo(() => [...clubs].sort((a, b) => a.name.localeCompare(b.name)), [clubs]);
  const [aId, setAId] = useState<string>(selectedClubId ?? allClubs[0]?.id ?? '');
  const [bId, setBId] = useState<string>(() => {
    const other = allClubs.find((c) => c.id !== (selectedClubId ?? allClubs[0]?.id));
    return other?.id ?? allClubs[0]?.id ?? '';
  });
  const [metric, setMetric] = useState<'price' | 'squadValue' | 'leaguePosition'>('price');
  const [picker, setPicker] = useState<'a' | 'b' | null>(null);

  const a = allClubs.find((c) => c.id === aId);
  const b = allClubs.find((c) => c.id === bId);
  if (!a || !b) return <Shell><ScreenHeader title="Compare Clubs" onBack={() => navigate('league-home')} /><div className="p-8 text-center text-ink-400">No clubs to compare.</div></Shell>;

  const aPrice = computePrice(a);
  const bPrice = computePrice(b);
  const aCh = change24h(a.priceHistory);
  const bCh = change24h(b.priceHistory);

  const aAnalytics = MOCK_ANALYTICS[a.id];
  const bAnalytics = MOCK_ANALYTICS[b.id];

  const series = useMemo(() => {
    if (metric === 'price') {
      return [
        { label: a.shortName, color: a.brandColor, points: a.priceHistory.map((p) => p.p) },
        { label: b.shortName, color: b.brandColor2, points: b.priceHistory.map((p) => p.p) },
      ];
    }
    if (metric === 'squadValue' && aAnalytics && bAnalytics) {
      return [
        { label: a.shortName, color: a.brandColor, points: aAnalytics.squadValueTrend.map((d) => d.value) },
        { label: b.shortName, color: b.brandColor2, points: bAnalytics.squadValueTrend.map((d) => d.value) },
      ];
    }
    if (metric === 'leaguePosition' && aAnalytics && bAnalytics) {
      return [
        { label: a.shortName, color: a.brandColor, points: aAnalytics.leaguePositions.map((d) => d.position) },
        { label: b.shortName, color: b.brandColor2, points: bAnalytics.leaguePositions.map((d) => d.position) },
      ];
    }
    return [];
  }, [metric, a, b, aAnalytics, bAnalytics]);

  const yFmt = metric === 'price' ? (v: number) => `$${v.toFixed(2)}` : metric === 'squadValue' ? (v: number) => `$${v.toFixed(1)}M` : (v: number) => `#${Math.round(v)}`;
  const metricLabel = metric === 'price' ? 'Share price (30d)' : metric === 'squadValue' ? 'Squad value ($M)' : 'League position';

  const pickClub = (id: string) => {
    if (picker === 'a') { if (id !== bId) setAId(id); }
    else if (picker === 'b') { if (id !== aId) setBId(id); }
    setPicker(null);
  };

  return (
    <Shell>
      <ScreenHeader title="Compare Clubs" subtitle="Side-by-side market comparison" onBack={() => navigate('league-home')} />

      <div className="px-4 pt-4 pb-24">
        {/* two club pickers */}
        <div className="grid grid-cols-2 gap-3">
          <ClubPicker club={a} tone="A" color={a.brandColor} onPick={() => setPicker('a')} />
          <ClubPicker club={b} tone="B" color={b.brandColor2} onPick={() => setPicker('b')} />
        </div>

        {/* quick stats comparison */}
        <div className="card mt-3 p-3">
          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-[10px] text-ink-400 uppercase font-semibold">Price</p>
              <p className="font-display font-extrabold text-base tabular" style={{ color: a.brandColor }}>${aPrice.toFixed(2)}</p>
              <ChangePill value={aCh} />
            </div>
            <div className="border-x border-ink-100 dark:border-ink-800">
              <p className="text-[10px] text-ink-400 uppercase font-semibold">vs</p>
              <p className="font-display font-extrabold text-base text-ink-400">—</p>
              <span className="text-[10px] text-ink-400">{diff(aPrice, bPrice)}</span>
            </div>
            <div>
              <p className="text-[10px] text-ink-400 uppercase font-semibold">Price</p>
              <p className="font-display font-extrabold text-base tabular" style={{ color: b.brandColor2 }}>${bPrice.toFixed(2)}</p>
              <ChangePill value={bCh} />
            </div>
          </div>
        </div>

        {/* metric selector */}
        <div className="mt-4 flex gap-1 p-1 bg-ink-100 dark:bg-ink-800 rounded-xl">
          {([
            { k: 'price', label: 'Price', icon: TrendingUp },
            { k: 'squadValue', label: 'Squad value', icon: BarChart3 },
            { k: 'leaguePosition', label: 'Position', icon: MapPin },
          ] as const).map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.k}
                onClick={() => setMetric(m.k)}
                className={`tap tap-scale flex-1 h-9 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${metric === m.k ? 'bg-white dark:bg-ink-900 text-primary-600 dark:text-primary-400 shadow-card' : 'text-ink-500'}`}
              >
                <Icon size={13} /> {m.label}
              </button>
            );
          })}
        </div>

        {/* overlay chart */}
        <div className="card mt-3 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-bold text-sm">{metricLabel}</h2>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: a.brandColor }} /> {a.abbr}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: b.brandColor2 }} /> {b.abbr}</span>
            </div>
          </div>
          <CompareOverlay series={series} yFmt={yFmt} height={200} />
          {metric === 'leaguePosition' && <p className="text-[11px] text-ink-400 mt-2">Lower is better (1st place at the bottom).</p>}
        </div>

        {/* side-by-side facts */}
        <div className="card mt-3 overflow-hidden">
          <FactRow label="Stadium" a={a.stadium} b={b.stadium} />
          <FactRow label="Capacity" a={a.stadiumCapacity.toLocaleString()} b={b.stadiumCapacity.toLocaleString()} />
          <FactRow label="Avg attendance" a={a.avgAttendance.toLocaleString()} b={b.avgAttendance.toLocaleString()} />
          <FactRow label="Founded" a={String(a.foundedYear)} b={String(b.foundedYear)} />
          <FactRow label="Points" a={String(a.points)} b={String(b.points)} />
          <FactRow label="Shares left" a={`${a.sharesAvailable}/${a.totalShares}`} b={`${b.sharesAvailable}/${b.totalShares}`} last />
        </div>

        <FooterNav />
      </div>

      {/* picker sheet */}
      {picker && (
        <>
          <div className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm animate-fade-in" onClick={() => setPicker(null)} />
          <div className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-ink-900 rounded-t-3xl shadow-card-lg animate-sheet-up max-h-[70vh] flex flex-col safe-bottom">
            <div className="px-5 pt-4 pb-3 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-base">Pick club {picker.toUpperCase()}</h3>
              <button onClick={() => setPicker(null)} className="tap text-sm font-semibold text-ink-500">Cancel</button>
            </div>
            <div className="overflow-y-auto no-scrollbar p-3 space-y-1.5">
              {allClubs.map((c) => {
                const selected = (picker === 'a' && c.id === aId) || (picker === 'b' && c.id === bId);
                const disabled = (picker === 'a' && c.id === bId) || (picker === 'b' && c.id === aId);
                return (
                  <button
                    key={c.id}
                    disabled={disabled}
                    onClick={() => pickClub(c.id)}
                    className={`tap tap-scale w-full flex items-center gap-3 p-2.5 rounded-xl text-left ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-ink-100 dark:hover:bg-ink-800'} ${selected ? 'bg-ink-100 dark:bg-ink-800' : ''}`}
                  >
                    <ClubLogo abbr={c.abbr} color={c.brandColor} color2={c.brandColor2} size={34} />
                    <span className="flex-1 font-semibold text-sm">{c.shortName}</span>
                    {selected && <Check size={18} className="text-primary-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}

function ClubPicker({ club, tone, color, onPick }: { club: ReturnType<typeof useApp>['clubs'][number]; tone: 'A' | 'B'; color: string; onPick: () => void }) {
  return (
    <button onClick={onPick} className="tap tap-scale card p-3 flex flex-col items-center gap-2 hover:border-primary-300 dark:hover:border-primary-700">
      <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: color }}>{tone}</span>
      <ClubLogo abbr={club.abbr} color={club.brandColor} color2={club.brandColor2} size={44} />
      <span className="font-semibold text-sm text-center leading-tight">{club.shortName}</span>
      <span className="flex items-center gap-1 text-[11px] text-ink-400"><ChevronDown size={12} /> change</span>
    </button>
  );
}

function FactRow({ label, a, b, last }: { label: string; a: string; b: string; last?: boolean }) {
  return (
    <div className={`grid grid-cols-3 items-center px-3 py-2.5 text-sm ${last ? '' : 'border-b border-ink-50 dark:border-ink-800/60'}`}>
      <span className="text-ink-500 dark:text-ink-400 text-left truncate">{a}</span>
      <span className="text-[11px] text-ink-400 uppercase font-semibold text-center">{label}</span>
      <span className="text-ink-700 dark:text-ink-200 text-right truncate">{b}</span>
    </div>
  );
}

function diff(a: number, b: number): string {
  const d = a - b;
  const pct = b !== 0 ? (d / b) * 100 : 0;
  return `${d >= 0 ? '+' : ''}${d.toFixed(2)} (${pct.toFixed(1)}%)`;
}
