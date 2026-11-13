// futbolgirlx wordmark + badge logo.
import { APP_NAME } from '../config';

export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="fx-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ec4899" />
          <stop offset="0.55" stopColor="#db2777" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#fx-grad)" />
      <path
        d="M24 11l4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3L24 34.7l-9.3 4.9 1.8-10.3-7.5-7.3 10.4-1.5L24 11z"
        fill="#fff" fillOpacity="0.96"
      />
    </svg>
  );
}

export function Logo({ size = 40, showWord = true, className = '' }: { size?: number; showWord?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showWord && (
        <span className="font-display font-extrabold tracking-tight text-lg leading-none">
          <span className="text-gradient">futbol</span>
          <span className="text-ink-900 dark:text-white">girl</span>
          <span className="text-secondary-500">x</span>
        </span>
      )}
    </div>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${className}`}>
      <span className="text-gradient">{APP_NAME.slice(0, 6)}</span>
      <span className="text-ink-900 dark:text-white">{APP_NAME.slice(6, 10)}</span>
      <span className="text-secondary-500">{APP_NAME.slice(10)}</span>
    </span>
  );
}
