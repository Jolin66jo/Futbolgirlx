// Static content page layout reused by About / How to Use / Disclaimer.

import type { ReactNode } from 'react';
import { useApp } from '../state/AppContext';
import { Shell, ScreenHeader } from '../components/Shell';
import { FooterNav } from '../components/BottomNav';

export function ContentPage({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { navigate } = useApp();
  return (
    <Shell>
      <ScreenHeader title={title} subtitle={subtitle} onBack={() => navigate('league-home')} />
      <div className="px-5 pt-5 pb-24 prose-sm">
        <article className="space-y-4 text-[15px] leading-relaxed text-ink-700 dark:text-ink-300">
          {children}
        </article>
        <FooterNav />
      </div>
    </Shell>
  );
}

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section>
      {title && <h2 className="font-display font-bold text-base text-ink-900 dark:text-white mb-1.5">{title}</h2>}
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="space-y-2 pl-1">{children}</ul>;
}

export function LI({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
