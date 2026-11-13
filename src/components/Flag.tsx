// Country flags — inline SVG so they render on all platforms (including iOS,
// which blocks flag emoji). Each flag is a simple but accurate rendition.
// Supports the 9 country codes used by the app's leagues.

import type { CountryCode } from '../types';

const flags: Record<CountryCode, React.ReactNode> = {
  // United States — 13 stripes, canton with stars represented as a blue block
  us: (
    <svg viewBox="0 0 60 40" className="w-full h-full">
      <rect width="60" height="40" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={i * (40 / 13)} width="60" height={40 / 13} fill="#b22234" />
      ))}
      <rect width="24" height={40 * 6 / 13} fill="#3c3b6e" />
    </svg>
  ),
  // Great Britain — Union Jack
  gb: (
    <svg viewBox="0 0 60 40" className="w-full h-full">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 L60 40 M60 0 L0 40" stroke="#c8102e" strokeWidth="2" />
      <path d="M30 0 V40 M0 20 H60" stroke="#fff" strokeWidth="7" />
      <path d="M30 0 V40 M0 20 H60" stroke="#c8102e" strokeWidth="4" />
    </svg>
  ),
  // Mexico — vertical green/white/red
  mx: (
    <svg viewBox="0 0 60 40" className="w-full h-full">
      <rect width="20" height="40" fill="#006847" />
      <rect x="20" width="20" height="40" fill="#fff" />
      <rect x="40" width="20" height="40" fill="#ce1126" />
      <circle cx="30" cy="20" r="5" fill="#006847" opacity="0.5" />
    </svg>
  ),
  // Sweden — Nordic cross, blue with yellow cross
  se: (
    <svg viewBox="0 0 60 40" className="w-full h-full">
      <rect width="60" height="40" fill="#005293" />
      <rect x="18" width="8" height="40" fill="#fecc00" />
      <rect y="16" width="60" height="8" fill="#fecc00" />
    </svg>
  ),
  // Italy — vertical green/white/red
  it: (
    <svg viewBox="0 0 60 40" className="w-full h-full">
      <rect width="20" height="40" fill="#009246" />
      <rect x="20" width="20" height="40" fill="#fff" />
      <rect x="40" width="20" height="40" fill="#ce2b37" />
    </svg>
  ),
  // Portugal — vertical green/red with coat of arms shield (simplified)
  pt: (
    <svg viewBox="0 0 60 40" className="w-full h-full">
      <rect width="24" height="40" fill="#006600" />
      <rect x="24" width="36" height="40" fill="#ff0000" />
      <circle cx="24" cy="20" r="6" fill="#fff" />
      <circle cx="24" cy="20" r="4" fill="#006600" />
      <rect x="22" y="17" width="4" height="6" fill="#ff0000" />
    </svg>
  ),
  // Spain — red/yellow/red horizontal with crest (simplified)
  es: (
    <svg viewBox="0 0 60 40" className="w-full h-full">
      <rect width="60" height="40" fill="#c60b1e" />
      <rect y="10" width="60" height="20" fill="#ffc400" />
      <circle cx="30" cy="20" r="4" fill="#c60b1e" opacity="0.6" />
    </svg>
  ),
  // Canada — red/white/red vertical with maple leaf
  ca: (
    <svg viewBox="0 0 60 40" className="w-full h-full">
      <rect width="15" height="40" fill="#ff0000" />
      <rect x="15" width="30" height="40" fill="#fff" />
      <rect x="45" width="15" height="40" fill="#ff0000" />
      <path d="M30 9 L32 16 L39 14 L35 20 L39 26 L32 24 L30 31 L28 24 L21 26 L25 20 L21 14 L28 16 Z" fill="#ff0000" />
    </svg>
  ),
  // Europe — EU flag, blue with circle of stars
  eu: (
    <svg viewBox="0 0 60 40" className="w-full h-full">
      <rect width="60" height="40" fill="#003399" />
      <g fill="#ffcc00">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const cx = 30 + Math.cos(a) * 9;
          const cy = 20 + Math.sin(a) * 6;
          return <circle key={i} cx={cx} cy={cy} r="1.4" />;
        })}
      </g>
    </svg>
  ),
};

export function Flag({
  code,
  size = 24,
  className = '',
  rounded = true,
}: {
  code: CountryCode;
  size?: number;
  className?: string;
  rounded?: boolean;
}) {
  return (
    <span
      className={`inline-block overflow-hidden shrink-0 ${rounded ? 'rounded-md' : ''} ring-1 ring-ink-200/60 dark:ring-ink-700/60 ${className}`}
      style={{ width: size, height: size * 2 / 3 }}
      aria-label={code.toUpperCase()}
      role="img"
    >
      {flags[code]}
    </span>
  );
}
