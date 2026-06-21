import { motion } from 'framer-motion';
import { Wallet, TrendingUp, RefreshCcw, Clock, History } from 'lucide-react';
import { Card, ChangeTypeBadge, Skeleton, SectionTag } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/format';
import type { BalanceChange, BalanceChangeType } from '@/lib/types';

const typeIcon: Record<BalanceChangeType, React.ReactNode> = {
  充值: <TrendingUp className="h-3.5 w-3.5" />,
  消费: <Wallet className="h-3.5 w-3.5" />,
  退款: <RefreshCcw className="h-3.5 w-3.5" />,
  过期: <Clock className="h-3.5 w-3.5" />,
};

const typeDot: Record<BalanceChangeType, string> = {
  充值: 'bg-forest-500',
  消费: 'bg-brick-500',
  退款: 'bg-gold-500',
  过期: 'bg-ink-300',
};

const typeAmount: Record<BalanceChangeType, string> = {
  充值: 'text-forest-700',
  消费: 'text-brick-600',
  退款: 'text-forest-700',
  过期: 'text-ink-500',
};

export function BalanceTimeline({
  changes,
  loading,
}: {
  changes: BalanceChange[];
  loading: boolean;
}) {
  const income = changes.filter((c) => c.amount > 0).reduce((s, c) => s + c.amount, 0);
  const expense = changes.filter((c) => c.amount < 0).reduce((s, c) => s + c.amount, 0);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-forest-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
            <History className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <SectionTag>Balance · 余额变动</SectionTag>
            <h3 className="font-serif text-base font-semibold text-ink-800">余额变动明细</h3>
          </div>
        </div>
        {changes.length > 0 && (
          <div className="hidden text-right text-xs sm:block">
            <p className="text-forest-700">
              收入 <b className="tnum">{formatCurrency(income)}</b>
            </p>
            <p className="text-brick-600">
              支出 <b className="tnum">{formatCurrency(Math.abs(expense))}</b>
            </p>
          </div>
        )}
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : changes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-forest-300">
              <History className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium text-ink-600">暂无余额变动</p>
            <p className="text-xs text-ink-400">当前筛选区间内无充值、消费、退款或过期记录</p>
          </div>
        ) : (
          <ol className="relative space-y-1">
            <span className="absolute bottom-2 left-[7px] top-2 w-px bg-forest-100" aria-hidden />
            {changes.map((c, idx) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="relative flex gap-4 py-2.5"
              >
                <span
                  className={cn(
                    'z-10 mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ring-4 ring-cream-50',
                    typeDot[c.type],
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                </span>
                <div className="min-w-0 flex-1 border-b border-forest-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <ChangeTypeBadge type={c.type} />
                        <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                          {typeIcon[c.type]}
                          {formatRelativeDate(c.date)} · {formatDate(c.date, true).split(' ')[1]}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-ink-600">{c.note}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={cn('tnum font-serif text-base font-semibold', typeAmount[c.type])}>
                        {c.amount > 0 ? '+' : ''}
                        {formatCurrency(c.amount)}
                      </p>
                      <p className="tnum text-[11px] text-ink-400">余额 {formatCurrency(c.balanceAfter)}</p>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </Card>
  );
}
