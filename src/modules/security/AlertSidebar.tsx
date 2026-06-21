import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, AlertTriangle, ChevronRight, Eye } from 'lucide-react';
import { Card, AlertStatusBadge, Skeleton, SectionTag } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatCurrency, formatRelativeDate, maskPhone } from '@/lib/format';
import type { AnomalyAlert } from '@/lib/types';

export function AlertSidebar({
  alerts,
  loading,
  highlightMemberId,
  onTriggerVerify,
  onViewDetail,
}: {
  alerts: AnomalyAlert[];
  loading: boolean;
  highlightMemberId: string | null;
  onTriggerVerify: (a: AnomalyAlert) => void;
  onViewDetail: (a: AnomalyAlert) => void;
}) {
  const pending = alerts.filter((a) => a.status !== '已解除');

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-forest-100 bg-brick-50/40 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brick-100 text-brick-600">
            <ShieldAlert className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <SectionTag className="text-brick-600">Security · 安全预警</SectionTag>
            <h3 className="font-serif text-base font-semibold text-ink-800">异常消费监测</h3>
          </div>
        </div>
        {pending.length > 0 && (
          <span className="tnum flex h-6 min-w-6 items-center justify-center rounded-full bg-brick-500 px-1.5 text-xs font-semibold text-cream-50">
            {pending.length}
          </span>
        )}
      </div>

      <div className="scroll-thin max-h-[640px] space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-forest-400">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium text-ink-600">监测正常</p>
            <p className="max-w-[16rem] text-xs text-ink-400">
              暂无异常消费行为，引擎持续扫描同日高频与大额消费
            </p>
          </div>
        ) : (
          alerts.map((a, idx) => {
            const isHigh = a.severity === '高';
            const resolved = a.status === '已解除';
            const highlighted = highlightMemberId === a.memberId && !resolved;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  'relative rounded-xl border p-3.5 transition',
                  resolved
                    ? 'border-forest-100 bg-cream-50/50 opacity-70'
                    : isHigh
                      ? 'border-brick-200 bg-brick-50/40'
                      : 'border-gold-200 bg-gold-50/40',
                  highlighted && 'ring-2 ring-brick-300',
                  isHigh && !resolved && 'animate-pulse-ring',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className={cn('h-3.5 w-3.5', isHigh ? 'text-brick-500' : 'text-gold-600')} />
                      <span className="truncate text-sm font-semibold text-ink-800">{a.memberName}</span>
                      <span className="shrink-0 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-500">
                        {a.severity}风险
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      {maskPhone(a.memberPhone)} · {formatRelativeDate(a.date)}
                    </p>
                  </div>
                  <AlertStatusBadge status={a.status} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-600">{a.reason}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="tnum text-xs text-ink-500">
                    {a.count} 笔 · 合计{' '}
                    <b className={isHigh ? 'text-brick-600' : 'text-gold-700'}>
                      {formatCurrency(a.totalAmount)}
                    </b>
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onViewDetail(a)}
                    className="btn-focus flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-forest-50 px-2 py-1.5 text-xs font-medium text-forest-700 transition hover:bg-forest-100"
                  >
                    <Eye className="h-3 w-3" />
                    查看详情
                  </button>
                  {!resolved && (
                    <button
                      onClick={() => onTriggerVerify(a)}
                      className="btn-focus flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-brick-100 px-2 py-1.5 text-xs font-medium text-brick-700 transition hover:bg-brick-200"
                    >
                      <ShieldAlert className="h-3 w-3" />
                      发起验证
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
}
