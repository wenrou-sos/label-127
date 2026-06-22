import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText,
  Receipt,
  Wallet,
  Banknote,
  CreditCard,
  Gift,
  UserPlus,
  CalendarDays,
  Store,
  Smartphone,
  ArrowLeftRight,
  ArrowUpRight,
} from 'lucide-react';
import { CashierSidebar } from '@/components/layout/CashierSidebar';
import { BrandMark } from '@/components/layout/BrandMark';
import { Card, CardHeader, CardBody, PaymentBadge, Skeleton } from '@/components/ui';
import { mockService } from '@/lib/mock/service';
import { subscribeToDataChanges, STORES } from '@/lib/mock/data';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import type { DailyReport } from '@/lib/types';
import { cn } from '@/lib/utils';

const statCards = [
  {
    key: 'orderCount',
    label: '今日接单数',
    icon: Receipt,
    tone: 'text-forest-600 bg-forest-50',
    format: (r: DailyReport) => formatNumber(r.orderCount) + ' 单',
  },
  {
    key: 'totalRevenue',
    label: '总营收',
    icon: Wallet,
    tone: 'text-gold-600 bg-gold-50',
    format: (r: DailyReport) => formatCurrency(r.totalRevenue),
  },
  {
    key: 'cashTopup',
    label: '现金补差总额',
    icon: Banknote,
    tone: 'text-brick-600 bg-brick-50',
    format: (r: DailyReport) => formatCurrency(r.cashTopup),
  },
  {
    key: 'storedValueSpent',
    label: '储值卡消费总额',
    icon: CreditCard,
    tone: 'text-sky-600 bg-sky-50',
    format: (r: DailyReport) => formatCurrency(r.storedValueSpent),
  },
  {
    key: 'packageUsageCount',
    label: '套餐消耗次数',
    icon: Gift,
    tone: 'text-violet-600 bg-violet-50',
    format: (r: DailyReport) => formatNumber(r.packageUsageCount) + ' 次',
  },
  {
    key: 'newMemberCount',
    label: '新增会员数',
    icon: UserPlus,
    tone: 'text-emerald-600 bg-emerald-50',
    format: (r: DailyReport) => formatNumber(r.newMemberCount) + ' 人',
  },
];

export default function DailyReportPage() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(STORES[0]);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToDataChanges(() => {
      setRefreshTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const r = await mockService.getDailyReport(store);
    setReport(r);
    setLoading(false);
  }, [store]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport, refreshTick]);

  return (
    <div className="relative min-h-screen lg:flex">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grain opacity-[0.5]" />
      <CashierSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-forest-100 bg-cream-100/85 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <BrandMark size="sm" showText={false} />
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-600">收银端 · Cashier</p>
                <h1 className="font-serif text-lg font-semibold text-ink-800">营业日报表</h1>
              </div>
              <div className="lg:hidden">
                <h1 className="font-serif text-base font-semibold text-ink-800">日报表</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs text-ink-500 shadow-sm sm:inline-flex">
                <CalendarDays className="h-3.5 w-3.5 text-forest-500" />
                {formatDate(new Date().toISOString())}
              </span>
              <Link
                to="/member/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-forest-700 px-3.5 py-2 text-xs font-medium text-cream-50 shadow-sm transition hover:bg-forest-800 lg:hidden"
              >
                <Smartphone className="h-3.5 w-3.5" />
                会员端
              </Link>
            </div>
          </div>
        </header>

        <main className="space-y-6 p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-serif text-lg font-semibold text-ink-800">收银员交班汇总</h2>
                <label className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
                  <Store className="h-3.5 w-3.5 shrink-0" />
                  <select
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    disabled={loading}
                    className="max-w-[14rem] cursor-pointer truncate rounded-md border border-forest-200 bg-white/80 px-2 py-1 text-xs font-medium text-ink-600 transition hover:border-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-400 disabled:cursor-wait disabled:opacity-60"
                  >
                    {STORES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-gold-200 bg-gold-50 px-4 py-2.5">
              <ArrowLeftRight className="h-4 w-4 text-gold-600" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gold-600">今日充值总额</p>
                <div className="tnum font-serif text-lg font-semibold text-gold-700">
                  {loading ? <Skeleton className="h-5 w-20" /> : report ? formatCurrency(report.rechargeAmount) : '-'}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {statCards.map((c, i) => (
              <motion.div
                key={c.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full p-4">
                  <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', c.tone)}>
                    <c.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  {loading || !report ? (
                    <div className="mt-3 space-y-2">
                      <Skeleton className="h-7 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="tnum font-serif text-2xl font-semibold text-ink-800">
                        {c.format(report)}
                      </p>
                      <p className="mt-1 text-xs text-ink-400">{c.label}</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <CardHeader
                  icon={<Wallet className="h-5 w-5" />}
                  title="支付方式明细"
                  subtitle="按支付方式拆分今日营收"
                />
                <CardBody>
                  {loading || !report ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {report.paymentBreakdown.map((p) => {
                        const totalAmount = report.totalRevenue || 1;
                        const pct = p.amount > 0 ? Math.round((p.amount / totalAmount) * 100) : 0;
                        return (
                          <div
                            key={p.method}
                            className="flex items-center justify-between rounded-xl border border-forest-100 bg-forest-50/40 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <PaymentBadge method={p.method} />
                              <div>
                                <p className="text-xs text-ink-400">{p.count} 笔交易</p>
                                <p className="text-[11px] text-ink-300">占比 {pct}%</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="tnum font-serif text-xl font-semibold text-ink-800">
                                {p.method === '套餐扣次' ? '—' : formatCurrency(p.amount)}
                              </p>
                              {p.method !== '套餐扣次' && p.amount > 0 && (
                                <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-forest-100">
                                  <div
                                    className="h-full rounded-full bg-forest-500 transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader
                  icon={<ArrowUpRight className="h-5 w-5" />}
                  title="服务项目排行"
                  subtitle="今日营收 Top 服务项目"
                />
                <CardBody>
                  {loading || !report ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : report.topServices.length === 0 ? (
                    <div className="py-8 text-center text-sm text-ink-300">今日暂无服务记录</div>
                  ) : (
                    <div className="space-y-2">
                      {report.topServices.map((s, i) => (
                        <div
                          key={s.name}
                          className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-cream-50"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold',
                                i === 0
                                  ? 'bg-gold-100 text-gold-700'
                                  : i === 1
                                  ? 'bg-ink-100 text-ink-600'
                                  : i === 2
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-forest-50 text-forest-500',
                              )}
                            >
                              {i + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-ink-700">{s.name}</p>
                              <p className="text-[11px] text-ink-400">{formatNumber(s.qty)} 件/次</p>
                            </div>
                          </div>
                          <p className="tnum font-serif text-sm font-semibold text-ink-800">
                            {formatCurrency(s.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader
                icon={<Receipt className="h-5 w-5" />}
                title="今日交易明细"
                subtitle="按时间倒序展示所有交易记录"
              />
              <CardBody>
                {loading || !report ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : report.recentOrders.length === 0 ? (
                  <div className="py-12 text-center text-sm text-ink-300">今日暂无交易记录</div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-forest-100">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-forest-50/60">
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-400">时间</th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-400">会员</th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-400">服务项目</th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-400">支付方式</th>
                          <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-ink-400">金额</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-forest-100">
                        {report.recentOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-cream-50">
                            <td className="px-4 py-3">
                              <span className="tnum text-sm text-ink-600">{o.time}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-ink-700">{o.memberName}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-ink-500">{o.items}</span>
                            </td>
                            <td className="px-4 py-3">
                              <PaymentBadge method={o.paymentMethod} />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="tnum text-sm font-semibold text-ink-800">
                                {o.paymentMethod === '套餐扣次' ? '—' : formatCurrency(o.amount)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
