// Five reusable analytics chart components (Prompt 12).
// Each is a self-contained SVG chart so they can be dropped into any screen.
// 1. LeaguePositionSparkline  — 5-year finishing positions (inverted: 1 is best)
// 2. SquadValueTrendLine       — squad value ($) per season
// 3. PlayerTurnoverBars        — turnover % per season
// 4. CoachTenureTimeline       — horizontal span timeline
// 5. AttendanceTrendLine       — avg attendance per season

import type { ClubAnalytics, CoachTenure, LeaguePositionPoint, SeasonValue } from '../types';

const W = 300;
const H = 120;
const PAD = 10;

function axisX(values: { season: number }[], pad = PAD, w = W) {
  const seasons = values.map((v) => v.season);
  const min = Math.min(...seasons);
  const max = Math.max(...seasons);
  return (s: number) => pad + ((s - min) / Math.max(1, max - min)) * (w - pad * 2);
}

// 1) League position sparkline (inverted Y: position 1 at top)
export function LeaguePositionSparkline({ data, className = '' }: { data: LeaguePositionPoint[]; className?: string }) {
  if (data.length < 2) return <Empty />;
  const maxX = axisX(data);
  const positions = data.map((d) => d.position);
  const minP = 1;
  const maxP = Math.max(...positions, 8);
  const y = (p: number) => PAD + ((p - minP) / (maxP - minP)) * (H - PAD * 2);
  const coords = data.map((d) => [maxX(d.season), y(d.position)]);
  const line = coords.map(([x, yy], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yy.toFixed(1)}`).join(' ');
  return (
    <Chart className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        {[1, 4, 8].map((p) => maxP >= p && (
          <line key={p} x1={PAD} x2={W - PAD} y1={y(p)} y2={y(p)} stroke="currentColor" className="text-ink-200 dark:text-ink-800" strokeDasharray="3 4" />
        ))}
        <path d={line} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map(([x, yy], i) => (
          <g key={i}>
            <circle cx={x} cy={yy} r="4" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
            <text x={x} y={yy - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0ea5e9" className="tabular">{data[i].position}</text>
          </g>
        ))}
      </svg>
      <XLabels items={data.map((d) => ({ label: String(d.season), x: maxX(d.season) / W }))} />
    </Chart>
  );
}

// 2) Squad value trend line
export function SquadValueTrendLine({ data, className = '' }: { data: SeasonValue[]; className?: string }) {
  if (data.length < 2) return <Empty />;
  return <TrendChart data={data} color="#ec4899" valueFmt={(v) => `$${v.toFixed(1)}M`} className={className} />;
}

// 3) Player turnover bar chart
export function PlayerTurnoverBars({ data, className = '' }: { data: SeasonValue[]; className?: string }) {
  if (data.length < 2) return <Empty />;
  const maxX = axisX(data);
  const maxV = Math.max(...data.map((d) => d.value), 50);
  const bw = 28;
  return (
    <Chart className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        {[25, 50].map((g) => (
          <line key={g} x1={PAD} x2={W - PAD} y1={H - PAD - (g / maxV) * (H - PAD * 2)} y2={H - PAD - (g / maxV) * (H - PAD * 2)} stroke="currentColor" className="text-ink-200 dark:text-ink-800" strokeDasharray="3 4" />
        ))}
        {data.map((d) => {
          const x = maxX(d.season);
          const h = (d.value / maxV) * (H - PAD * 2);
          return (
            <g key={d.season}>
              <rect x={x - bw / 2} y={H - PAD - h} width={bw} height={h} rx="4" fill="#f43f5e" opacity="0.85" />
              <text x={x} y={H - PAD - h - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#f43f5e" className="tabular">{Math.round(d.value)}%</text>
            </g>
          );
        })}
      </svg>
      <XLabels items={data.map((d) => ({ label: String(d.season), x: maxX(d.season) / W }))} />
    </Chart>
  );
}

// 4) Coach tenure timeline
export function CoachTenureTimeline({ data, className = '' }: { data: CoachTenure[]; className?: string }) {
  if (!data.length) return <Empty />;
  const allYears = data.flatMap((c) => [c.startSeason, c.endSeason ?? new Date().getFullYear()]);
  const min = Math.min(...allYears);
  const max = Math.max(...allYears);
  const x = (y: number) => PAD + ((y - min) / Math.max(1, max - min)) * (W - PAD * 2);
  const colors = ['#ec4899', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];
  const rowH = 22;
  const th = Math.max(H, data.length * rowH + PAD * 2);
  return (
    <Chart className={className}>
      <svg viewBox={`0 0 ${W} ${th}`} width="100%" height={th}>
        {data.map((c, i) => {
          const end = c.endSeason ?? new Date().getFullYear();
          const x1 = x(c.startSeason);
          const x2 = x(end);
          const yy = PAD + i * rowH + 8;
          const col = colors[i % colors.length];
          return (
            <g key={c.id}>
              <rect x={x1} y={yy} width={Math.max(8, x2 - x1)} height="10" rx="5" fill={col} opacity="0.9" />
              <text x={x1} y={yy - 3} fontSize="9" fontWeight="700" fill="currentColor" className="text-ink-600 dark:text-ink-300">
                {c.coach} ({c.startSeason}–{c.endSeason ?? 'now'})
              </text>
            </g>
          );
        })}
      </svg>
    </Chart>
  );
}

// 5) Attendance trend line
export function AttendanceTrendLine({ data, className = '' }: { data: SeasonValue[]; className?: string }) {
  if (data.length < 2) return <Empty />;
  return <TrendChart data={data} color="#10b981" valueFmt={(v) => v.toLocaleString()} className={className} />;
}

// --- shared helpers ----------------------------------------------------------

function TrendChart({ data, color, valueFmt, className }: { data: SeasonValue[]; color: string; valueFmt: (v: number) => string; className?: string }) {
  const maxX = axisX(data);
  const vals = data.map((d) => d.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const y = (v: number) => H - PAD - ((v - minV) / Math.max(1, maxV - minV)) * (H - PAD * 2);
  const coords = data.map((d) => [maxX(d.season), y(d.value)]);
  const line = coords.map(([x, yy], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yy.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)} ${H - PAD} L${coords[0][0].toFixed(1)} ${H - PAD} Z`;
  const gid = `tc-${color.replace('#', '')}`;
  return (
    <Chart className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
            <stop stopColor={color} stopOpacity="0.28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map(([x, yy], i) => (
          <g key={i}>
            <circle cx={x} cy={yy} r="3.5" fill={color} stroke="#fff" strokeWidth="2" />
            <text x={x} y={yy - 8} textAnchor="middle" fontSize="8" fontWeight="700" fill={color} className="tabular">{valueFmt(data[i].value)}</text>
          </g>
        ))}
      </svg>
      <XLabels items={data.map((d) => ({ label: String(d.season), x: maxX(d.season) / W }))} />
    </Chart>
  );
}

function Chart({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full ${className}`}>{children}</div>;
}
function Empty() { return <div className="text-xs text-ink-400 py-4 text-center">No data.</div>; }

function XLabels({ items }: { items: { label: string; x: number }[] }) {
  return (
    <div className="relative h-4 mt-1 text-[9px] text-ink-400 tabular">
      {items.map((it, i) => (
        <span key={i} className="absolute -translate-x-1/2" style={{ left: `${it.x * 100}%` }}>{it.label}</span>
      ))}
    </div>
  );
}

// Composite analytics panel — all 5 charts in labeled cards (used on Club Detail).
export function AnalyticsPanel({ analytics }: { analytics: ClubAnalytics }) {
  return (
    <div className="space-y-4">
      <ChartCard title="League position" subtitle="5-year finishing position (lower = better)">
        <LeaguePositionSparkline data={analytics.leaguePositions} />
      </ChartCard>
      <ChartCard title="Squad value" subtitle="Estimated squad value ($M)">
        <SquadValueTrendLine data={analytics.squadValueTrend} />
      </ChartCard>
      <ChartCard title="Player turnover" subtitle="% of squad changed per season">
        <PlayerTurnoverBars data={analytics.playerTurnover} />
      </ChartCard>
      <ChartCard title="Coach tenure" subtitle="Head coach spans">
        <CoachTenureTimeline data={analytics.coachTenure} />
      </ChartCard>
      <ChartCard title="Average attendance" subtitle="Per-season average">
        <AttendanceTrendLine data={analytics.attendanceTrend} />
      </ChartCard>
    </div>
  );
}

export function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-display font-bold text-sm">{title}</h3>
        {subtitle && <span className="text-[11px] text-ink-400">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
