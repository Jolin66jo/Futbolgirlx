// Full-width price history line chart for the Club Detail screen.
// Pure SVG, no charting library. Shows the last N days with a gradient area,
// min/max labels, a hoverable last-point dot, and a soft grid.

import { useMemo, useState } from 'react';
import type { PricePoint } from '../types';

export function PriceChart({
  data,
  color = '#ec4899',
  height = 180,
  className = '',
}: {
  data: PricePoint[];
  color?: string;
  height?: number;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 320;
  const H = height;
  const padX = 8;
  const padY = 16;

  const { path, area, coords, min, max, last } = useMemo(() => {
    if (data.length < 2) return { path: '', area: '', coords: [] as number[][], min: 0, max: 0, last: 0 };
    const ps = data.map((d) => d.p);
    const min = Math.min(...ps);
    const max = Math.max(...ps);
    const span = max - min || 1;
    const step = (W - padX * 2) / (data.length - 1);
    const coords = ps.map((p, i) => [
      padX + i * step,
      H - padY - ((p - min) / span) * (H - padY * 2),
    ]);
    const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    const area = `${line} L${(W - padX).toFixed(1)} ${H - padY} L${padX} ${H - padY} Z`;
    return { path: line, area, coords, min, max, last: ps[ps.length - 1] };
  }, [data, H]);

  if (data.length < 2) return <div className="text-sm text-ink-400">No price history yet.</div>;
  const gradId = `pc-${color.replace('#', '')}`;

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    coords.forEach(([cx], i) => {
      const d = Math.abs(cx - x);
      if (d < best) { best = d; nearest = i; }
    });
    setHover(nearest);
  }

  const hoverPt = hover != null ? coords[hover] : null;
  const hoverPrice = hover != null ? data[hover].p : last;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
            <stop stopColor={color} stopOpacity="0.28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid */}
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={padX} x2={W - padX} y1={padY + g * (H - padY * 2)} y2={padY + g * (H - padY * 2)} stroke="currentColor" className="text-ink-200 dark:text-ink-800" strokeDasharray="3 4" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {hoverPt && (
          <>
            <line x1={hoverPt[0]} x2={hoverPt[0]} y1={padY} y2={H - padY} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <circle cx={hoverPt[0]} cy={hoverPt[1]} r="5" fill={color} stroke="#fff" strokeWidth="2" />
          </>
        )}
        {!hoverPt && <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="4" fill={color} stroke="#fff" strokeWidth="2" />}
      </svg>
      <div className="flex items-center justify-between text-[11px] text-ink-400 mt-1 px-1 tabular">
        <span>low ${min.toFixed(2)}</span>
        <span className="font-semibold text-ink-600 dark:text-ink-300">${hoverPrice.toFixed(2)}</span>
        <span>high ${max.toFixed(2)}</span>
      </div>
    </div>
  );
}
