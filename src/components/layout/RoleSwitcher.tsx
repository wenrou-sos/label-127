import { Link, useLocation } from 'react-router-dom';
import { Store, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RoleSwitcher({ mode }: { mode: 'cashier' | 'member' }) {
  const items = [
    { to: '/cashier', label: '收银端', icon: Store, active: mode === 'cashier' },
    { to: '/member', label: '会员端', icon: Smartphone, active: mode === 'member' },
  ];
  return (
    <div className="inline-flex items-center rounded-xl bg-forest-900/30 p-1">
      {items.map((it) => (
        <Link
          key={it.to}
          to={it.to}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
            it.active ? 'bg-cream-50 text-forest-800 shadow-sm' : 'text-cream-100/70 hover:text-cream-50',
          )}
        >
          <it.icon className="h-3.5 w-3.5" />
          {it.label}
        </Link>
      ))}
    </div>
  );
}

export function useIsActive(path: string) {
  const { pathname } = useLocation();
  return pathname === path;
}
