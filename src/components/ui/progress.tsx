import { cn } from '@/lib/utils';

export function Progress({
  value,
  max,
  className,
  barClassName,
}: {
  value: number;
  max: number;
  className?: string;
  barClassName?: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-forest-100', className)}>
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500 transition-[width] duration-700 ease-out',
          barClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
