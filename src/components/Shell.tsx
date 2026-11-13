// App shell — constrains content to a phone-width column, adds top safe area.

import type { ReactNode } from 'react';

export function Shell({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className={`mx-auto w-full max-w-md flex-1 flex flex-col ${padded ? '' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export function ScreenHeader({ title, subtitle, right, onBack }: { title: ReactNode; subtitle?: ReactNode; right?: ReactNode; onBack?: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-ink-950/90 backdrop-blur-lg border-b border-ink-200/70 dark:border-ink-800 safe-top">
      <div className="flex items-center gap-3 px-4 h-14">
        {onBack && (
          <button onClick={onBack} className="tap tap-scale -ml-1 p-1.5 rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-base leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-[11px] text-ink-400 truncate">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
