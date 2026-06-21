import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Store, BarChart3 } from 'lucide-react';
import { Card, SectionTag, Skeleton } from '@/components/ui';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { mockService } from '@/lib/mock/service';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { ChartDataPoint } from '@/components/charts/LineChart';

type TabType = 'weekly' | 'stores';

export function TrendChart() {
  const [tab, setTab] = useState<TabType>('weekly');
  const [weeklyData, setWeeklyData] = useState<{ date: string; amount: number; count: number }[]>([]);
  const [storeData, setStoreData] = useState<{ store: string; amount: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([mockService.getWeeklyTrend(), mockService.getStoreStats()]).then(([w, s]) => {
      setWeeklyData(w);
      setStoreData(s);
      setLoading(false);
    });
  }, []);

  const weeklyChartData: ChartDataPoint[] = weeklyData.map((d) => ({
    label: d.date.slice(5),
    value: d.amount,
  }));

  const storeChartData = storeData.map((d) => ({
    label: d.store.split('·')[1]?.trim() || d.store,
    value: d.amount,
    subLabel: `${d.count}笔`,
  }));

  const totalWeekly = weeklyData.reduce((s, d) => s + d.amount, 0);
  const totalStores = storeData.reduce((s, d) => s + d.amount, 0);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-forest-100 px-4 py-3 sm:px-5 sm:py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest-50 text-forest-700 sm:h-9 sm:w-9">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
          </span>
          <div>
            <SectionTag className="text-[10px] sm:text-xs">Analytics · 趋势分析</SectionTag>
            <h3 className="font-serif text-sm font-semibold text-ink-800 sm:text-base">营业趋势统计</h3>
          </div>
        </div>
        <div className="inline-flex w-full rounded-xl bg-forest-50 p-1 sm:w-auto">
          {[
            { key: 'weekly' as const, label: '近7天', icon: <TrendingUp className="h-3.5 w-3.5" /> },
            { key: 'stores' as const, label: '门店分布', icon: <Store className="h-3.5 w-3.5" /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`btn-focus flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition sm:flex-none sm:px-3 ${
                tab === t.key ? 'bg-white text-forest-700 shadow-sm' : 'text-forest-600 hover:text-forest-800'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.key === 'weekly' ? '7天趋势' : '门店'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {tab === 'weekly' ? (
              <>
                <LineChart
                  data={weeklyChartData}
                  height={180}
                  color="#2d5a4a"
                  gradientFrom="rgba(45, 90, 74, 0.25)"
                  gradientTo="rgba(45, 90, 74, 0)"
                  formatValue={(v) => `¥${v}`}
                />
                <div className="mt-3 flex items-center justify-between border-t border-forest-50 pt-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-forest-500" />
                    <span className="text-xs text-ink-500">近7天营业额</span>
                  </div>
                  <span className="tnum font-serif text-lg font-semibold text-forest-700">
                    {formatCurrency(totalWeekly)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <BarChart
                  data={storeChartData}
                  height={180}
                  color="#c9a24b"
                  formatValue={(v) => formatNumber(v)}
                />
                <div className="mt-3 flex items-center justify-between border-t border-forest-50 pt-3">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-gold-500" />
                    <span className="text-xs text-ink-500">本月门店合计</span>
                  </div>
                  <span className="tnum font-serif text-lg font-semibold text-gold-600">
                    {formatCurrency(totalStores)}
                  </span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
}
