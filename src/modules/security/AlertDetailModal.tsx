import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  Phone,
  Calendar,
  Store,
  Receipt,
  ChevronRight,
} from 'lucide-react';
import { Modal, Button, AlertStatusBadge, LevelBadge } from '@/components/ui';
import { mockService } from '@/lib/mock/service';
import { formatCurrency, formatDate, formatRelativeDate, maskPhone } from '@/lib/format';
import type { AnomalyAlert, ConsumptionRecord, MemberSummary } from '@/lib/types';
import { Avatar } from '@/components/layout/Avatar';

interface AlertDetailModalProps {
  open: boolean;
  alert: AnomalyAlert | null;
  onClose: () => void;
  onVerify: (alert: AnomalyAlert) => void;
}

export function AlertDetailModal({ open, alert, onClose, onVerify }: AlertDetailModalProps) {
  const [records, setRecords] = useState<ConsumptionRecord[]>([]);
  const [memberSummary, setMemberSummary] = useState<MemberSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !alert) return;
    setLoading(true);
    Promise.all([
      mockService.getConsumptionRecords(alert.memberId),
      mockService.getMemberSummary(alert.memberId),
    ]).then(([recs, summary]) => {
      const related = recs.filter((r) => alert.recordIds.includes(r.id));
      setRecords(related);
      setMemberSummary(summary);
      setLoading(false);
    });
  }, [open, alert]);

  const isHigh = alert?.severity === '高';
  const resolved = alert?.status === '已解除';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={resolved ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
      title="预警详情"
      subtitle="异常消费行为分析与处理"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            关闭
          </Button>
          {!resolved && alert && (
            <Button onClick={() => onVerify(alert)} variant={isHigh ? 'danger' : 'primary'}>
              <ShieldCheck className="h-4 w-4" />
              发起短信验证
            </Button>
          )}
        </>
      }
    >
      {alert && (
        <div className="space-y-5">
          {/* 预警状态卡片 */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 ${
              resolved
                ? 'border border-forest-200 bg-forest-50/60'
                : isHigh
                  ? 'border border-brick-200 bg-brick-50/60'
                  : 'border border-gold-200 bg-gold-50/60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    resolved
                      ? 'bg-forest-100 text-forest-600'
                      : isHigh
                        ? 'bg-brick-100 text-brick-600'
                        : 'bg-gold-100 text-gold-600'
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-semibold text-ink-800">{alert.reason}</h3>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatRelativeDate(alert.date)} · {formatDate(alert.date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Receipt className="h-3 w-3" />
                      {alert.count} 笔消费
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="tnum font-medium">{formatCurrency(alert.totalAmount)}</span>
                    </span>
                  </div>
                </div>
              </div>
              <AlertStatusBadge status={alert.status} />
            </div>
          </motion.div>

          {/* 会员信息 */}
          {memberSummary && (
            <div className="rounded-2xl border border-forest-100 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-forest-600" />
                <span className="text-sm font-semibold text-ink-700">会员信息</span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar name={memberSummary.name} seed={memberSummary.avatarSeed} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink-800">{memberSummary.name}</span>
                    <LevelBadge level={memberSummary.level} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {maskPhone(memberSummary.phone)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      储值 {formatCurrency(memberSummary.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 关联消费记录 */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-forest-600" />
                <span className="text-sm font-semibold text-ink-700">关联消费记录</span>
              </div>
              <span className="text-xs text-ink-400">共 {records.length} 笔</span>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-ink-100/50 animate-pulse" />
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {records.map((r, idx) => (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="rounded-xl border border-forest-100 bg-white p-3 transition hover:border-forest-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(r.date, true).split(' ')[1]}
                          </span>
                          <span className="text-ink-300">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            {r.store}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm font-medium text-ink-700">
                          {r.items.map((i) => `${i.name}×${i.qty}`).join(' + ')}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="tnum font-serif text-base font-semibold text-ink-800">
                          {formatCurrency(r.total)}
                        </p>
                        <p className="text-[11px] text-ink-400">{r.paymentMethod}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>

          {/* 处理建议 */}
          <div className="rounded-xl bg-ink-50 p-3">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
              <div className="text-xs text-ink-500">
                <p className="font-medium text-ink-600">处理建议</p>
                <p className="mt-1 leading-relaxed">
                  系统检测到该会员存在异常消费行为，建议先与会员核实确认。如需继续办理业务，请点击「发起短信验证」完成身份核验。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
