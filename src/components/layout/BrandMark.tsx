import { cn } from '@/lib/utils';

export function BrandMark({
  size = 'md',
  showText = true,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}) {
  const box = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const text = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  const sub = size === 'sm' ? 'text-[9px]' : 'text-[10px]';
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-xl bg-forest-700 text-cream-50 shadow-sm',
          box,
        )}
      >
        <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none" aria-hidden>
          <path
            d="M12 2.5c3.4 3.6 5.6 6.6 5.6 9.6a5.6 5.6 0 1 1-11.2 0c0-3 2.2-6 5.6-9.6Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path
            d="M12 22.4a3.4 3.4 0 0 0 3.4-3.4c0-1.7-1.7-3.3-3.4-5.1-1.7 1.8-3.4 3.4-3.4 5.1A3.4 3.4 0 0 0 12 22.4Z"
            fill="#C9A24B"
          />
        </svg>
      </div>
      {showText && (
        <div className="leading-none">
          <div className={cn('font-serif font-semibold tracking-tight text-ink-800', text)}>
            净致干洗
          </div>
          <div className={cn('mt-1 font-medium uppercase tracking-[0.22em] text-forest-600', sub)}>
            Fabric Care
          </div>
        </div>
      )}
    </div>
  );
}
