import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Receipt, Store, ChevronDown, MapPin, CalendarDays, Inbox } from 'lucide-react';
import { Card, PaymentBadge, Skeleton, SectionTag, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/format';
import type { ConsumptionRecord } from '@/lib/types';

const PAGE_SIZE = 5;

export function ConsumptionList({
  records,
  loading,
  hasMember,
}: {
  records: ConsumptionRecord[];
  loading: boolean;
  hasMember: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    setExpanded(null);
  }, [records]);

  const paged = useMemo(() => records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [records, page]);
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const totalAmount = useMemo(() => records.reduce((s, r) => s + r.total, 0), [records]);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-forest-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
            <Receipt className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <SectionTag>Consumption · 消费明细</SectionTag>
            <h3 className="font-serif text-base font-semibold text-ink-800">会员消费记录</h3>
          </div>
        </div>
        {hasMember && records.length > 0 && (
          <div className="text-right">
            <p className="tnum font-serif text-lg font-semibold text-forest-700">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-xs text-ink-400">共 {records.length} 笔</p>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !hasMember ? (
          <EmptyState
            icon={<Inbox className="h-7 w-7" />}
            title="请先核验会员"
            desc="在上方输入手机号或刷卡后，此处将按时间倒序展示该会员的消费明细"
          />
        ) : records.length === 0 ? (
          <EmptyState icon={<Inbox className="h-7 w-7" />} title="暂无消费记录" desc="该会员当前筛选区间内无消费数据" />
        ) : (
          <>
            <ul className="space-y-3">
              {paged.map((r, idx) => {
                const open = expanded === r.id;
                const itemsText = r.items.map((i) => `${i.name}×${i.qty}`).join(' + ');
                return (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={cn(
                      'rounded-xl border bg-white transition-colors',
                      open ? 'border-forest-300 shadow-card' : 'border-forest-100 hover:border-forest-200',
                    )}
                  >
                    <button
                      onClick={() => setExpanded(open ? null : r.id)}
                      className="btn-focus w-full px-4 py-3.5 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
                            <span className="inline-flex items-center gap-1 font-medium text-forest-600">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatRelativeDate(r.date)}
                            </span>
                            <span className="text-ink-300">·</span>
                            <span className="inline-flex items-center gap-1">
                              <Store className="h-3.5 w-3.5" />
                              {r.store}
                            </span>
                          </div>
                          <p className="mt-1.5 truncate text-sm font-medium text-ink-800">{itemsText}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <PaymentBadge method={r.paymentMethod} />
                            <span className="text-xs text-ink-400">
                              {formatDate(r.date, true).split(' ')[1]}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="tnum font-serif text-lg font-semibold text-ink-800">
                            {formatCurrency(r.total)}
                          </span>
                          {r.deductedAmount !== r.total && (
                            <span className="tnum text-xs text-ink-400">
                              实扣 {formatCurrency(r.deductedAmount)}
                            </span>
                          )}
                          <ChevronDown
                            className={cn('h-4 w-4 text-ink-300 transition-transform', open && 'rotate-180')}
                          />
                        </div>
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-forest-100"
                        >
                          <div className="space-y-1.5 px-4 py-3">
                            {r.items.map((it, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-ink-600">
                                  {it.name} <span className="text-ink-400">×{it.qty}</span>
                                </span>
                                <span className="tnum text-ink-500">
                                  {formatCurrency(it.price)} /件 · {formatCurrency(it.price * it.qty)}
                                </span>
                              </div>
                            ))}
                            <div className="mt-1.5 flex items-center justify-between border-t border-dashed border-forest-100 pt-2 text-sm">
                              <span className="inline-flex items-center gap-1 text-ink-400">
                                <MapPin className="h-3.5 w-3.5" />
                                合计
                              </span>
                              <span className="tnum font-semibold text-forest-700">
                                {formatCurrency(r.total)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-ink-400">
                  第 {page} / {totalPages} 页 · 每页 {PAGE_SIZE} 笔
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    上一页
                  </Button>
                  <Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-300">
        {icon}
      </span>
      <p className="text-sm font-medium text-ink-600">{title}</p>
      <p className="max-w-xs text-xs text-ink-400">{desc}</p>
    </div>
  );
}
