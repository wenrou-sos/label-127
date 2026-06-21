import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert, Smartphone, CalendarDays } from 'lucide-react';
import { CashierSidebar } from '@/components/layout/CashierSidebar';
import { BrandMark } from '@/components/layout/BrandMark';
import { MemberQueryBar } from '@/modules/cashier/MemberQueryBar';
import { StatOverview } from '@/modules/cashier/StatOverview';
import { TrendChart } from '@/modules/cashier/TrendChart';
import { MemberCardModal } from '@/modules/cashier/MemberCardModal';
import { ConsumptionList } from '@/modules/cashier/ConsumptionList';
import { AlertSidebar } from '@/modules/security/AlertSidebar';
import { SmsVerifyModal } from '@/modules/security/SmsVerifyModal';
import { AlertDetailModal } from '@/modules/security/AlertDetailModal';
import { useToast } from '@/components/ui';
import { mockService } from '@/lib/mock/service';
import { formatDate } from '@/lib/format';
import type { Member, MemberSummary, ConsumptionRecord, AnomalyAlert, CashierStats } from '@/lib/types';

export default function CashierPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<CashierStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [summary, setSummary] = useState<MemberSummary | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [records, setRecords] = useState<ConsumptionRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const [verifyAlert, setVerifyAlert] = useState<AnomalyAlert | null>(null);
  const [detailAlert, setDetailAlert] = useState<AnomalyAlert | null>(null);

  const refreshAlerts = useCallback(async () => {
    setAlertsLoading(true);
    const list = await mockService.detectAllAnomalies();
    setAlerts(list);
    setAlertsLoading(false);
  }, []);

  const refreshStats = useCallback(async () => {
    setStatsLoading(true);
    const s = await mockService.getCashierStats();
    setStats(s);
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    refreshStats();
    refreshAlerts();
  }, [refreshStats, refreshAlerts]);

  const handleResult = useCallback(
    async (m: Member | null) => {
      if (!m) return;
      setCurrentMember(m);
      setModalOpen(true);
      setCardLoading(true);
      setRecordsLoading(true);
      const [sum, recs] = await Promise.all([
        mockService.getMemberSummary(m.id),
        mockService.getConsumptionRecords(m.id),
      ]);
      setSummary(sum);
      setRecords(recs);
      setCardLoading(false);
      setRecordsLoading(false);
      toast({ tone: 'success', title: '会员核验成功', desc: `${m.name} · ${m.level}会员` });
    },
    [toast],
  );

  const handleViewRecords = useCallback(() => {
    setModalOpen(false);
    document.getElementById('records')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleVerified = useCallback(
    (alertId: string) => {
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: '已解除' } : a)));
      refreshStats();
      toast({ tone: 'success', title: '预警已解除', desc: '短信验证通过，消费拦截已解除' });
    },
    [refreshStats, toast],
  );

  const handleViewDetail = useCallback((alert: AnomalyAlert) => {
    setDetailAlert(alert);
  }, []);

  const handleVerifyFromDetail = useCallback((alert: AnomalyAlert) => {
    setDetailAlert(null);
    setTimeout(() => setVerifyAlert(alert), 200);
  }, []);

  return (
    <div className="relative min-h-screen lg:flex">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grain opacity-[0.5]" />
      <CashierSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* 顶栏 */}
        <header className="sticky top-0 z-30 border-b border-forest-100 bg-cream-100/85 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <BrandMark size="sm" showText={false} />
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest-600">收银端 · Cashier</p>
                <h1 className="font-serif text-lg font-semibold text-ink-800">会员消费查询工作台</h1>
              </div>
              <div className="lg:hidden">
                <h1 className="font-serif text-base font-semibold text-ink-800">消费查询</h1>
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

        {/* 主体 */}
        <main id="workbench" className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <MemberQueryBar onResult={handleResult} />
            <StatOverview stats={stats} loading={statsLoading} />
            <TrendChart />
            <motion.div id="records" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ConsumptionList records={records} loading={recordsLoading} hasMember={!!currentMember} />
            </motion.div>
          </div>

          <div id="alerts" className="h-fit lg:sticky lg:top-24">
            <div className="mb-2 flex items-center gap-1.5 px-1 lg:hidden">
              <ShieldAlert className="h-4 w-4 text-brick-500" />
              <span className="text-sm font-semibold text-ink-700">安全预警</span>
            </div>
            <AlertSidebar
              alerts={alerts}
              loading={alertsLoading}
              highlightMemberId={currentMember?.id ?? null}
              onTriggerVerify={(a) => setVerifyAlert(a)}
              onViewDetail={handleViewDetail}
            />
          </div>
        </main>
      </div>

      <MemberCardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        summary={summary}
        loading={cardLoading}
        onViewRecords={handleViewRecords}
      />
      <SmsVerifyModal
        open={!!verifyAlert}
        alert={verifyAlert}
        onClose={() => setVerifyAlert(null)}
        onVerified={handleVerified}
      />
      <AlertDetailModal
        open={!!detailAlert}
        alert={detailAlert}
        onClose={() => setDetailAlert(null)}
        onVerify={handleVerifyFromDetail}
      />
    </div>
  );
}
