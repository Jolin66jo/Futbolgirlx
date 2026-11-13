// Small UI primitives.

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-glow disabled:opacity-50',
  secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-glow-sky disabled:opacity-50',
  success: 'bg-success-500 hover:bg-success-600 text-white disabled:opacity-50',
  danger: 'bg-error-500 hover:bg-error-600 text-white disabled:opacity-50',
  outline: 'border border-ink-200 dark:border-ink-700 text-ink-800 dark:text-ink-100 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-50',
  ghost: 'text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-50',
};
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-13 px-6 text-base rounded-2xl gap-2 py-3.5',
};

export function Button({ variant = 'primary', size = 'md', block, leftIcon, rightIcon, className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      className={`tap tap-scale inline-flex items-center justify-center font-semibold transition-colors ${variants[variant]} ${sizes[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

export function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'error' | 'warning' | 'brand' | 'sky'; className?: string }) {
  const tones: Record<string, string> = {
    neutral: 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300',
    success: 'bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-400',
    error: 'bg-error-100 text-error-700 dark:bg-error-500/15 dark:text-error-400',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400',
    brand: 'bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
    sky: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-500/15 dark:text-secondary-300',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}>{children}</span>;
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-ink-200/70 dark:bg-ink-800 ${className}`} />;
}

export function ChangePill({ value, className = '' }: { value: number; className?: string }) {
  const up = value >= 0;
  return (
    <span className={`tabular inline-flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-xs font-bold ${up ? 'bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-400' : 'bg-error-100 text-error-700 dark:bg-error-500/15 dark:text-error-400'} ${className}`}>
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  );
}
