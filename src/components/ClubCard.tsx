// Reusable club card for lists. Tapping navigates to club detail.

import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Club } from '../types';
import { ClubLogo } from './ClubLogo';
import { Sparkline } from './Sparkline';
import { ChangePill } from './ui';
import { computePrice, change24h } from '../lib/pricing';
import { useApp } from '../state/AppContext';

export function ClubCard({ club, index }: { club: Club; index?: number }) {
  const { navigate } = useApp();
  const price = computePrice(club);
  const ch = change24h(club.priceHistory);
  const up = ch >= 0;
  const stroke = up ? '#10b981' : '#ef4444';
  const fill = up ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)';

  return (
    <button
      onClick={() => navigate('club-detail', { clubId: club.id })}
      className="tap tap-scale card w-full text-left p-3.5 flex items-center gap-3.5 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
    >
      {index != null && (
        <span className="w-5 text-center text-xs font-bold text-ink-400 tabular">{index + 1}</span>
      )}
      <ClubLogo abbr={club.abbr} color={club.brandColor} color2={club.brandColor2} size={44} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{club.shortName}</p>
        <p className="text-xs text-ink-400 truncate">{club.city}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="tabular text-sm font-bold">${price.toFixed(2)}</span>
          <ChangePill value={ch} />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Sparkline points={club.priceHistory.slice(-12).map((p) => p.p)} stroke={stroke} fill={fill} width={60} height={26} />
        <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${up ? 'text-success-600' : 'text-error-600'}`}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {club.sharesAvailable}/{club.totalShares}
        </span>
      </div>
    </button>
  );
}
