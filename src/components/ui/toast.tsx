import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastTone = 'success' | 'info' | 'warning' | 'error';

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  desc?: string;
}

interface ToastCtx {
  toast: (t: { tone?: ToastTone; title: string; desc?: string }) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

const toneMap: Record<ToastTone, { icon: ReactNode; ring: string }> = {
  success: { icon: <CheckCircle2 className="h-5 w-5 text-forest-600" />, ring: 'ring-forest-200' },
  info: { icon: <Info className="h-5 w-5 text-forest-600" />, ring: 'ring-forest-200' },
  warning: { icon: <AlertTriangle className="h-5 w-5 text-gold-600" />, ring: 'ring-gold-200' },
  error: { icon: <XCircle className="h-5 w-5 text-brick-600" />, ring: 'ring-brick-200' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback<ToastCtx['toast']>((t) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, tone: t.tone ?? 'info', title: t.title, desc: t.desc }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3600);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
          <AnimatePresence>
            {toasts.map((t) => {
              const cfg = toneMap[t.tone];
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: -16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  className={cn(
                    'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-pop ring-1 ring-inset',
                    cfg.ring,
                  )}
                >
                  <span className="mt-0.5 shrink-0">{cfg.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-800">{t.title}</p>
                    {t.desc && <p className="mt-0.5 text-xs text-ink-500">{t.desc}</p>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast 必须在 ToastProvider 内使用');
  return ctx;
}
