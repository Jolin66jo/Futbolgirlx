// "How is this valued?" modal — explains the four factors (Section 4).

import { Activity, Flame, MapPin, TrendingUp } from 'lucide-react';
import { Sheet } from '../components/Sheet';

export function ValuationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const factors = [
    { icon: Activity, color: '#10b981', title: 'On-field performance', body: 'Results drive the base value. Winning clubs, goal difference, and league position all lift the performance multiplier. A club on a hot streak is worth more than one stuck at the bottom.' },
    { icon: Flame, color: '#ec4899', title: 'Fan interest & buzz', body: 'Pack-out stadiums, growing social followings, viral moments, and transfer hype all add heat. We score each club\u2019s buzz on a 0\u2013100 index and fold it into the price.' },
    { icon: MapPin, color: '#0ea5e9', title: 'Location & fan base size', body: 'Big markets with deep fan bases carry a structural premium. A club in a soccer-mad city with season-ticket waitlists starts from a higher base than a newer market.' },
    { icon: TrendingUp, color: '#f43f5e', title: 'Scarcity', body: 'Every club has a fixed, limited number of shares. As shares sell out, the price rises automatically \u2014 up to 2.5x the base. The fewer shares left, the more the remaining ones cost.' },
  ];

  return (
    <Sheet open={open} onClose={onClose} title="How is this valued?" size="lg">
      <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
        A club's share price isn't pulled from thin air. It's built from four factors that move at different speeds \u2014 some slow and structural, some fast and market-driven.
      </p>

      {/* four-factor diagram */}
      <div className="my-5 grid grid-cols-4 gap-2">
        {factors.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-card" style={{ background: f.color }}>
                <Icon size={20} />
              </div>
              <span className="text-[10px] font-semibold leading-tight">{f.title.split(' ')[0]}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 mt-2">
        {factors.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex gap-3 p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: f.color }}>
                <Icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed mt-0.5">{f.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 p-3.5 rounded-xl bg-grad-brand-soft border border-primary-200/60 dark:border-primary-800/40">
        <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
          <span className="font-semibold">The formula:</span> price = base × performance multiplier × scarcity multiplier. Performance moves slowly with results. Scarcity moves every time someone trades.
        </p>
      </div>
    </Sheet>
  );
}
