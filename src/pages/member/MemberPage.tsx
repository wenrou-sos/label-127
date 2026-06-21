import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Store, Receipt, History } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { MemberHeaderCard } from '@/modules/member/MemberHeaderCard';
import { MemberStatsCard } from '@/modules/member/MemberStatsCard';
import { DateRangeFilter, computeQuick } from '@/modules/member/DateRangeFilter';
import { BalanceTimeline } from '@/modules/member/BalanceTimeline';
import { ConsumptionList } from '@/modules/cashier/ConsumptionList';
import { Tabs, Button, useToast } from '@/components/ui';
import type { TabItem } from '@/components/ui';
import { useAuthStore } from '@/lib/auth';
import { mockService } from '@/lib/mock/service';
import { recordsToCsv, downloadCsv } from '@/lib/csv';
import { formatDate } from '@/lib/format';
import type { MemberSummary, ConsumptionRecord, BalanceChange } from '@/lib/types';
import type { QuickKey } from '@/modules/member/DateRangeFilter';

const TABS: TabItem[] = [
  { value: 'consumption', label: '消费流水', icon: <Receipt className="h-3.5 w-3.5" /> },
  { value: 'balance', label: '余额变动', icon: <History className="h-3.5 w-3.5" /> },
];

export default function MemberPage() {
  const member = useAuthStore((s) => s.member);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState('consumption');
  const [quick, setQuick] = useState<QuickKey | null>('all');
  const [range, setRange] = useState(() => computeQuick('all'));

  const [summary, setSummary] = useState<MemberSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [records, setRecords] = useState<ConsumptionRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [changes, setChanges] = useState<BalanceChange[]>([]);
  const [changesLoading, setChangesLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const memberId = member?.id;

  useEffect(() => {
    if (!memberId) return;
    setSummaryLoading(true);
    mockService.getMemberSummary(memberId).then((s) => {
      setSummary(s);
      setSummaryLoading(false);
    });
  }, [memberId]);

  useEffect(() => {
    if (!memberId) return;
    setRecordsLoading(true);
    setChangesLoading(true);
    Promise.all([
      mockService.getConsumptionRecords(memberId, { range: [range.start, range.end] }),
      mockService.getBalanceChanges(memberId, { range: [range.start, range.end] }),
    ]).then(([r, c]) => {
      setRecords(r);
      setChanges(c);
      setRecordsLoading(false);
      setChangesLoading(false);
    });
  }, [memberId, range]);

  const handleQuick = useCallback((k: QuickKey | null) => {
    if (!k) {
      setQuick(null);
      return;
    }
    setQuick(k);
    setRange(computeQuick(k));
  }, []);

  const handleExport = useCallback(() => {
    if (records.length === 0) {
      toast({ tone: 'warning', title: '暂无可导出数据', desc: '当前筛选区间内无消费记录' });
      return;
    }
    setExporting(true);
    const csv = recordsToCsv(records);
    const filename = `净致干洗-消费账单-${member?.name ?? ''}-${formatDate(range.start)}至${formatDate(range.end)}.csv`;
    downloadCsv(filename, csv);
    setTimeout(() => setExporting(false), 500);
    toast({ tone: 'success', title: '导出成功', desc: `已导出 ${records.length} 条消费记录` });
  }, [records, range, member, toast]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/member/login', { replace: true });
  }, [logout, navigate]);

  if (!member) return <Navigate to="/member/login" replace />;

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grain opacity-50" />
      <header className="sticky top-0 z-30 border-b border-forest-100 bg-cream-100/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="sm:hidden">
              <BrandMark size="sm" showText={false} />
            </div>
            <div className="hidden sm:block">
              <BrandMark size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/cashier"
              className="inline-flex items-center gap-1.5 rounded-xl border border-forest-200 bg-white px-3 py-2 text-xs font-medium text-forest-700 transition hover:bg-forest-50"
            >
              <Store className="h-3.5 w-3.5" />
              收银端
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" />
              退出
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <MemberHeaderCard summary={summary} loading={summaryLoading} />

        {!summaryLoading && member && (
          <MemberStatsCard memberId={member.id} records={records} changes={changes} />
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs items={TABS} value={tab} onChange={setTab} />
          <p className="text-xs text-ink-400 sm:text-right">
            {formatDate(range.start)} 至 {formatDate(range.end)}
          </p>
        </div>

        <DateRangeFilter
          value={range}
          quick={quick}
          onQuick={handleQuick}
          onChange={setRange}
          onExport={handleExport}
          exporting={exporting}
        />

        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {tab === 'consumption' ? (
            <ConsumptionList records={records} loading={recordsLoading} hasMember />
          ) : (
            <BalanceTimeline changes={changes} loading={changesLoading} />
          )}
        </motion.div>

        <footer className="pt-2 text-center text-xs text-ink-300">
          净致干洗 · 会员消费记录查询与统计分析面板 · 数据为演示模拟
        </footer>
      </main>
    </div>
  );
}
