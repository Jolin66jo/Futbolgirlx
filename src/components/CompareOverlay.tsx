// Overlay comparison chart (Prompt 13).
// Plots two series (club A vs club B) on a shared time/value axis, financial-
// comparison style. Generic enough to overlay any two number-series with labels.

interface Series {
  label: string;
  color: string;
  points: number[];
}

export function CompareOverlay({
  series,
  height = 180,
  yFmt = (v: number) => v.toFixed(2),
  className = '',
}: {
  series: Series[];
  height?: number;
  yFmt?: (v: number) => string;
  className?: string;
}) {
  const W = 320;
  const PAD = 12;
  const all = series.flatMap((s) => s.points);
  if (!all.length) return <div className="text-xs text-ink-400 text-center py-6">No data to compare.</div>;
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const len = Math.max(...series.map((s) => s.points.length));
  const step = (W - PAD * 2) / Math.max(1, len - 1);
  const y = (v: number) => height - PAD - ((v - min) / span) * (height - PAD * 2);

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${height}`} width="100%" height={height}>
        {[0, 0.5, 1].map((g) => (
          <line key={g} x1={PAD} x2={W - PAD} y1={PAD + g * (height - PAD * 2)} y2={PAD + g * (height - PAD * 2)} stroke="currentColor" className="text-ink-200 dark:text-ink-800" strokeDasharray="3 4" />
        ))}
        {series.map((s) => {
          const coords = s.points.map((p, i) => [PAD + i * step, y(p)]);
          const line = coords.map(([x, yy], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yy.toFixed(1)}`).join(' ');
          return <path key={s.label} d={line} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />;
        })}
      </svg>
      <div className="flex items-center justify-between text-[10px] text-ink-400 mt-1 tabular px-2">
        <span>{yFmt(min)}</span>
        <span className="font-semibold text-ink-600 dark:text-ink-300">{yFmt(max)}</span>
      </div>
    </div>
  );
}
