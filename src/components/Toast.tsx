import { useToastStore, type ToastTone } from '@/store/toast-store';
import { cn } from '@/lib/utils';

const toneStyles: Record<ToastTone, string> = {
  success: 'bg-sage-dark text-cream',
  error: 'bg-mauve-dark text-cream',
  info: 'bg-slate-blue text-cream',
};

// Fixed-position toast stack. Mounted once at the app root.
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            'pointer-events-auto max-w-xs rounded-xl px-4 py-3 text-left font-sans text-sm shadow-warm-lg transition',
            toneStyles[t.tone]
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
