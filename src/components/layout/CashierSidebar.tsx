import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, ArrowRightLeft, UserRound, FileText } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { RoleSwitcher } from './RoleSwitcher';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/cashier', label: '工作台', icon: LayoutDashboard },
  { href: '/cashier/report', label: '日报表', icon: FileText },
  { href: '/cashier#alerts', label: '预警中心', icon: ShieldAlert },
];

export function CashierSidebar() {
  const location = useLocation();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-forest-800 text-cream-50 lg:flex">
      <div className="border-b border-forest-700/60 px-5 py-5">
        <BrandMark />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-100/40">
          收银工作台
        </p>
        {NAV.map((n) => {
          const isActive = location.pathname === n.href;
          return (
            <Link
              key={n.href}
              to={n.href}
              className={cn(
                'group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-forest-700 text-cream-50'
                  : 'text-cream-100/80 hover:bg-forest-700 hover:text-cream-50',
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3 border-t border-forest-700/60 px-4 py-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-forest-900/40 px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-ink-900">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">收银员 · 陈静</p>
            <p className="text-[10px] text-cream-100/50">静安旗舰店 · 工号 0218</p>
          </div>
        </div>
        <RoleSwitcher mode="cashier" />
        <Link
          to="/member/login"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-forest-700 px-3 py-2 text-xs font-medium text-cream-100/80 transition hover:bg-forest-700"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          切换至会员端登录
        </Link>
      </div>
    </aside>
  );
}
