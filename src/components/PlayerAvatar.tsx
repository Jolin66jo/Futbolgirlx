// Player avatar — generated initials tile (no image assets). Uses club brand colors.

import type { Player } from '../types';

export function PlayerAvatar({
  player,
  size = 44,
  className = '',
  ring = false,
}: {
  player: Player;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const initials = player.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const id = `pa-${player.id}`;
  const fontSize = size < 36 ? 12 : size < 56 ? 16 : 22;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-label={player.name}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor={player.brandColor} />
          <stop offset="1" stopColor={player.brandColor2} />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r={ring ? 22.5 : 23} fill={`url(#${id})`} />
      {ring && <circle cx="24" cy="24" r="22.5" fill="none" stroke="#fff" strokeWidth="1.5" />}
      <text x="24" y="25" textAnchor="middle" dominantBaseline="central" fontFamily="Sora, system-ui, sans-serif" fontWeight="800" fontSize={fontSize} fill="#fff" letterSpacing="0.5">
        {initials}
      </text>
    </svg>
  );
}
