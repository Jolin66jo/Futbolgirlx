// "shares available" indicator with progress bar for the Club Detail page.

export function ProgressShareBar({
  available,
  total,
  className = '',
}: {
  available: number;
  total: number;
  className?: string;
}) {
  const sold = total - available;
  const pctSold = Math.round((sold / total) * 100);
  const pctAvail = 100 - pctSold;
  const tight = pctSold > 75; // < 25% left -> "scarce"

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide">Shares available</p>
          <p className="font-display font-extrabold text-lg tabular">
            {available} <span className="text-ink-400 font-bold text-sm">/ {total}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-400">sold</p>
          <p className={`font-bold tabular text-sm ${tight ? 'text-primary-600 dark:text-primary-400' : 'text-ink-700 dark:text-ink-200'}`}>{pctSold}%</p>
        </div>
      </div>
      <div className="mt-2 h-2.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-500 ${tight ? 'bg-grad-brand' : 'bg-secondary-400'}`}
          style={{ width: `${pctSold}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        <span className="text-ink-400">{pctAvail}% available</span>
        {tight && <span className="font-semibold text-primary-600 dark:text-primary-400">Scarce — price rising</span>}
      </div>
    </div>
  );
}
