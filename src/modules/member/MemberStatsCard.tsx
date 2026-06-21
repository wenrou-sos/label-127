import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, TrendingUp, Receipt, Clock } from 'lucide-react';
import { Card, Skeleton, SectionTag } from '@/components/ui';
import { BarChart } from '@/components/charts/BarChart';
import { mockService } from '@/lib/mock/service';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { ConsumptionRecord, BalanceChange } from '@/lib/types';

interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  tone: string;
}

function StatTile({ icon, label, value, subValue, tone }: StatTileProps) {
  return (
    <div className="rounded-xl border border-forest-100 bg-white p-2.5 sm:p-3">
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${tone}`}>
          {icon}
        </span>
      </div>
      <p className="tnum mt-1.5 font-serif text-base font-semibold text-ink-800 sm:mt-2 sm:text-xl">{value}</p>
      <p className="text-[11px] text-ink-400 sm:text-xs">{label}</p>
      {subValue && <p className="mt-0.5 text-[10px] text-ink-300 sm:text-[11px]">{subValue}</p>}
    </div>
  );
}

export function MemberStatsCard({
  memberId,
  records,
  changes,
}: {
  memberId: string;
  records: ConsumptionRecord[];
  changes: BalanceChange[];
}) {
  const [monthlyData, setMonthlyData] = useState<{ month: string; amount: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    mockService.getMemberMonthlyStats(memberId).then((data) => {
      setMonthlyData(data);
      setLoading(false);
    });
  }, [memberId]);

  const totalSpent = records.reduce((s, r) => s + r.total, 0);
  const totalCount = records.length;
  const avgPerOrder = totalCount > 0 ? totalSpent / totalCount : 0;

  const rechargeTotal = changes.filter((c) => c.type === '充值').reduce((s, c) => s + c.amount, 0);
  const consumeTotal = Math.abs(changes.filter((c) => c.type === '消费').reduce((s, c) => s + c.amount, 0));

  const chartData = monthlyData.map((d) => ({
    label: d.month.slice(2).replace('-', '/'),
    value: d.amount,
    subLabel: `${d.count}笔`,
  }));

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-forest-100 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-50 text-gold-600 sm:h-9 sm:w-9">
            <PieChart className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
          </span>
          <div>
            <SectionTag className="text-gold-600 text-[10px] sm:text-xs">Stats · 消费统计</SectionTag>
            <h3 className="font-serif text-sm font-semibold text-ink-800 sm:text-base">我的消费概览</h3>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4">
          <StatTile
            icon={<Receipt className="h-3.5 w-3.5 text-forest-600 sm:h-4 sm:w-4" />}
            label="累计消费"
            value={formatCurrency(totalSpent)}
            subValue={`共 ${formatNumber(totalCount)} 笔`}
            tone="bg-forest-50"
          />
          <StatTile
            icon={<TrendingUp className="h-3.5 w-3.5 text-gold-600 sm:h-4 sm:w-4" />}
            label="累计充值"
            value={formatCurrency(rechargeTotal)}
            subValue="储值账户"
            tone="bg-gold-50"
          />
          <StatTile
            icon={<Clock className="h-3.5 w-3.5 text-forest-600 sm:h-4 sm:w-4" />}
            label="笔均消费"
            value={formatCurrency(avgPerOrder)}
            subValue="平均单价"
            tone="bg-forest-50"
          />
          <StatTile
            icon={<PieChart className="h-3.5 w-3.5 text-brick-600 sm:h-4 sm:w-4" />}
            label="消费支出"
            value={formatCurrency(consumeTotal)}
            subValue="仅消费类"
            tone="bg-brick-50"
          />
        </div>

        <div className="mt-4 sm:mt-5 border-t border-forest-50 pt-3 sm:pt-4">
          <div className="mb-2.5 sm:mb-3 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-ink-700">月度消费趋势</span>
            <span className="text-[11px] sm:text-xs text-ink-400">近6个月</span>
          </div>
          {loading ? (
            <Skeleton className="h-32 w-full sm:h-40" />
          ) : (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <BarChart
                data={chartData}
                height={120}
                color="#2d5a4a"
                formatValue={(v) => `¥${v}`}
              />
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
}
