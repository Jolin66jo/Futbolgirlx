// Onboarding step 2 — 3-screen swipeable walkthrough.

import { useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, Store, TrendingUp, Flame } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { Button } from '../components/ui';

interface Slide {
  icon: typeof Store;
  title: string;
  body: string;
  accent: string;
  visual: React.ReactNode;
}

const slides: Slide[] = [
  {
    icon: Store,
    title: 'Browse clubs',
    body: 'Explore NWSL clubs like stocks. Each club has a live share price driven by performance, fan buzz, and how many shares are left.',
    accent: '#ec4899',
    visual: <BrowseVisual />,
  },
  {
    icon: TrendingUp,
    title: 'Buy & sell shares',
    body: 'Use your cash balance to buy shares in clubs you believe in. Sell anytime. Every trade moves the market — prices update live.',
    accent: '#0ea5e9',
    visual: <BuySellVisual />,
  },
  {
    icon: Flame,
    title: 'Scarcity moves price',
    body: 'Each club has a limited number of shares. As shares sell out, the price climbs. Get in early on the clubs everyone wants.',
    accent: '#f43f5e',
    visual: <ScarcityVisual />,
  },
];

export function WalkthroughScreen() {
  const { navigate, completeOnboarding } = useApp();
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);

  const next = () => (i < slides.length - 1 ? setI(i + 1) : finish());
  const prev = () => i > 0 && setI(i - 1);
  const finish = () => { completeOnboarding(); navigate('choose-league'); };

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
    startX.current = null;
  };

  const slide = slides[i];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-ink-950">
      <div className="safe-top flex items-center justify-between px-5 h-14">
        <button onClick={prev} className={`tap p-1.5 rounded-lg text-ink-500 ${i === 0 ? 'invisible' : ''}`} aria-label="Previous">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-1.5">
          {slides.map((_, idx) => (
            <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-6 bg-primary-500' : 'w-1.5 bg-ink-300 dark:bg-ink-700'}`} />
          ))}
        </div>
        <button onClick={finish} className="tap text-sm font-semibold text-ink-500 hover:text-ink-800 dark:hover:text-ink-100">Skip</button>
      </div>

      <div
        className="flex-1 flex flex-col px-6 pb-8"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div key={i} className="flex-1 flex flex-col items-center justify-center text-center animate-slide-up">
          <div className="w-full h-56 flex items-center justify-center mb-8">{slide.visual}</div>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white shadow-card"
            style={{ background: slide.accent }}
          >
            <Icon size={26} />
          </div>
          <h2 className="font-display font-extrabold text-2xl mb-3">{slide.title}</h2>
          <p className="text-ink-500 dark:text-ink-400 text-[15px] leading-relaxed max-w-sm">{slide.body}</p>
        </div>

        <Button block size="lg" onClick={next} rightIcon={<ArrowRight size={18} />}>
          {i < slides.length - 1 ? 'Continue' : 'Get started'}
        </Button>
      </div>
    </div>
  );
}

// --- slide visuals ----------------------------------------------------------

function BrowseVisual() {
  const rows = [
    { abbr: 'POR', c1: '#e11d48', c2: '#1e293b', name: 'Thorns', price: '$88.40', up: true },
    { abbr: 'KC', c1: '#0ea5e9', c2: '#ec4899', name: 'Current', price: '$76.10', up: true },
    { abbr: 'GTH', c1: '#0f172a', c2: '#ec4899', name: 'Gotham', price: '$72.30', up: false },
  ];
  return (
    <div className="w-full max-w-xs space-y-2">
      {rows.map((r, idx) => (
        <div key={r.abbr} className="card p-3 flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${idx * 80}ms` }}>
          <svg width="36" height="36" viewBox="0 0 48 48"><rect x="1" y="1" width="46" height="46" rx="13" fill={r.c1} /><rect x="1" y="1" width="46" height="46" rx="13" fill={r.c2} fillOpacity="0.5" /><text x="24" y="25" textAnchor="middle" dominantBaseline="central" fontFamily="Sora" fontWeight="800" fontSize="13" fill="#fff">{r.abbr}</text></svg>
          <span className="font-semibold text-sm flex-1 text-left">{r.name}</span>
          <span className="tabular font-bold text-sm">{r.price}</span>
          <span className={`text-xs font-bold ${r.up ? 'text-success-600' : 'text-error-600'}`}>{r.up ? '▲' : '▼'}</span>
        </div>
      ))}
    </div>
  );
}

function BuySellVisual() {
  return (
    <div className="relative w-full max-w-xs">
      <div className="card p-4 animate-scale-in">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-ink-400">Buy shares in</span>
          <span className="font-semibold text-sm">Bay FC</span>
        </div>
        <div className="rounded-xl bg-ink-100 dark:bg-ink-800 p-3 text-center">
          <p className="text-3xl font-display font-extrabold tabular text-primary-600">$250</p>
          <p className="text-xs text-ink-500 mt-1">= 4.12 shares @ $60.68</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-success-500 text-white py-2.5 text-center font-semibold text-sm">BUY</div>
          <div className="rounded-xl bg-error-500 text-white py-2.5 text-center font-semibold text-sm">SELL</div>
        </div>
      </div>
    </div>
  );
}

function ScarcityVisual() {
  return (
    <div className="w-full max-w-xs">
      <div className="card p-4">
        <div className="flex justify-between text-xs text-ink-500 mb-2">
          <span>Sold</span><span>Available</span>
        </div>
        <div className="h-3 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden flex">
          <div className="h-full bg-grad-brand" style={{ width: '82%' }} />
        </div>
        <div className="flex justify-between mt-1.5 text-[11px]">
          <span className="font-bold text-primary-600">820 / 1000</span>
          <span className="text-ink-400">180 left</span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-success-600 font-bold">
          <TrendingUp size={18} />
          <span className="tabular">price +48% as shares run out</span>
        </div>
      </div>
    </div>
  );
}
