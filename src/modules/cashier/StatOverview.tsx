import { motion } from 'framer-motion';
import { Receipt, Wallet, UserPlus, ShieldAlert, PlusCircle } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { CashierStats } from '@/lib/types';

const cards = [
  { key: 'todayCount', label: '今日消费笔数', icon: Receipt, tone: 'text-forest-600 bg-forest-50', format: (s: CashierStats) => formatNumber(s.todayCount) + ' 笔' },
  { key: 'todayRevenue', label: '今日营业额', icon: Wallet, tone: 'text-gold-600 bg-gold-50', format: (s: CashierStats) => formatCurrency(s.todayRevenue) },
  { key: 'todayRecharge', label: '今日充值', icon: PlusCircle, tone: 'text-gold-600 bg-gold-50', format: (s: CashierStats) => formatCurrency(s.todayRecharge) },
  { key: 'pendingAlerts', label: '待处理预警', icon: ShieldAlert, tone: 'text-brick-600 bg-brick-50', format: (s: CashierStats) => formatNumber(s.pendingAlerts) + ' 条' },
] as const;

export function StatOverview({ stats, loading }: { stats: CashierStats | null; loading: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <Card className="h-full p-4">
            <div className="flex items-center justify-between">
              <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', c.tone)}>
                <c.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
            </div>
            {loading || !stats ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            ) : (
              <div className="mt-3">
                <p className="tnum font-serif text-2xl font-semibold text-ink-800">
                  {c.format(stats)}
                </p>
                <p className="mt-1 text-xs text-ink-400">{c.label}</p>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
