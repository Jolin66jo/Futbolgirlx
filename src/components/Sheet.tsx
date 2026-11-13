// Bottom sheet modal with backdrop, used for Valuation + Buy/Sell flows.

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const maxW = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-lg' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        role="dialog" aria-modal="true"
        className={`relative w-full ${maxW} bg-white dark:bg-ink-900 rounded-t-3xl sm:rounded-3xl shadow-card-lg animate-sheet-up sm:animate-scale-in max-h-[92vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-ink-100 dark:border-ink-800">
          <h3 className="font-display font-bold text-base">{title}</h3>
          <button onClick={onClose} className="tap tap-scale p-1.5 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-ink-100 hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto no-scrollbar">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-ink-100 dark:border-ink-800 safe-bottom">{footer}</div>}
      </div>
    </div>
  );
}

export function CenteredModal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: ReactNode }) {
  return (
    <Sheet open={open} onClose={onClose} title={title} size="md">{children}</Sheet>
  );
}
