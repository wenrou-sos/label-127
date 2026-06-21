import { cn } from '@/lib/utils';

const gradients = [
  'from-forest-600 to-forest-800',
  'from-gold-500 to-gold-700',
  'from-brick-400 to-brick-600',
  'from-forest-500 to-gold-600',
  'from-ink-500 to-forest-700',
  'from-gold-400 to-brick-500',
];

function pickGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return gradients[h % gradients.length];
}

export function Avatar({
  name,
  seed,
  size = 'md',
  className,
}: {
  name: string;
  seed: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const initial = name.slice(0, 1);
  const box =
    size === 'sm' ? 'h-9 w-9 text-sm' : size === 'lg' ? 'h-14 w-14 text-xl' : size === 'xl' ? 'h-20 w-20 text-3xl' : 'h-11 w-11 text-base';
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-serif font-semibold text-cream-50 shadow-sm ring-2 ring-white',
        pickGradient(seed),
        box,
        className,
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}
