// Club badge — generated from brand colors + abbreviation. No image assets needed.

export function ClubLogo({
  abbr,
  color,
  color2,
  size = 44,
  className = '',
}: {
  abbr: string;
  color: string;
  color2: string;
  size?: number;
  className?: string;
}) {
  const id = `cl-${abbr}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label={`${abbr} badge`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} />
          <stop offset="1" stopColor={color2} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill={`url(#${id})`} />
      <rect x="1" y="1" width="46" height="46" rx="13" stroke="rgba(255,255,255,0.18)" />
      <text
        x="24" y="25" textAnchor="middle" dominantBaseline="central"
        fontFamily="Sora, system-ui, sans-serif" fontWeight="800"
        fontSize={abbr.length > 3 ? 13 : 16} fill="#fff" letterSpacing="0.5"
      >
        {abbr}
      </text>
    </svg>
  );
}
