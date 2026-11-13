// Toast stack, bottom-center, auto-dismiss.

import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { useApp } from '../state/AppContext';

export function Toaster() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => {
        const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'error' ? XCircle : Info;
        const tone = t.tone === 'success' ? 'text-success-500' : t.tone === 'error' ? 'text-error-500' : 'text-secondary-500';
        return (
          <div key={t.id} className="pointer-events-auto w-full max-w-sm card flex items-start gap-3 p-3.5 animate-slide-up shadow-card-lg">
            <Icon size={20} className={`${tone} mt-0.5 shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{t.title}</p>
              {t.body && <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 break-words">{t.body}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="tap p-1 rounded text-ink-400 hover:text-ink-700 dark:hover:text-ink-100" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
