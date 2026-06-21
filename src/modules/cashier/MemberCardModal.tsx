import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Coins, Package, Sparkles, ListChecks } from 'lucide-react';
import { Modal, Button, LevelBadge, Progress, Skeleton } from '@/components/ui';
import { Avatar } from '@/components/layout/Avatar';
import { formatCurrency, maskPhone, formatDate } from '@/lib/format';
import type { MemberSummary } from '@/lib/types';

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-forest-100 bg-cream-50/60 p-3">
      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>
        {icon}
      </span>
      <p className="tnum mt-2 font-serif text-xl font-semibold text-ink-800">{value}</p>
      <p className="mt-0.5 text-xs text-ink-400">{label}</p>
    </div>
  );
}

export function MemberCardModal({
  open,
  onClose,
  summary,
  loading,
  onViewRecords,
}: {
  open: boolean;
  onClose: () => void;
  summary: MemberSummary | null;
  loading: boolean;
  onViewRecords: () => void;
}) {
  const upgrade = summary?.levelUpgrade;
  const upgradeText =
    upgrade && upgrade.nextLevel
      ? `本月再消费 ${formatCurrency(upgrade.remainingToUpgrade)} 升级 ${upgrade.nextLevel}`
      : '已达最高等级，尽享钻石权益';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Sparkles className="h-5 w-5" />}
      title="会员档案"
      subtitle="会员信息卡 · 储值 / 套餐 / 等级进度"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            关闭
          </Button>
          <Button onClick={onViewRecords}>
            <ListChecks className="h-4 w-4" />
            查看消费明细
          </Button>
        </>
      }
    >
      {loading || !summary ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* 会员头部 */}
          <div className="flex items-start gap-4 rounded-2xl bg-gradient-to-br from-forest-700 to-forest-800 p-5 text-cream-50">
            <Avatar name={summary.name} seed={summary.avatarSeed} size="xl" className="ring-cream-50/40" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-2xl font-semibold">{summary.name}</h3>
                <LevelBadge level={summary.level} className="bg-cream-50/15 text-gold-200 ring-gold-300/30" />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-cream-100/80">
                <span>手机 {maskPhone(summary.phone)}</span>
                <span>卡号 {summary.cardNo}</span>
                <span>入会 {formatDate(summary.registeredAt)}</span>
              </div>
            </div>
          </div>

          {/* 核心数据 */}
          <div className="grid grid-cols-3 gap-3">
            <StatTile
              icon={<Wallet className="h-4 w-4 text-forest-600" />}
              label="储值余额"
              value={formatCurrency(summary.balance)}
              tone="bg-forest-50"
            />
            <StatTile
              icon={<TrendingUp className="h-4 w-4 text-gold-600" />}
              label="本月累计消费"
              value={formatCurrency(summary.monthlySpent)}
              tone="bg-gold-50"
            />
            <StatTile
              icon={<Coins className="h-4 w-4 text-forest-600" />}
              label="累计消费"
              value={formatCurrency(summary.totalSpent)}
              tone="bg-forest-50"
            />
          </div>

          {/* 套餐余次 */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Package className="h-4 w-4 text-forest-600" />
              <h4 className="text-sm font-semibold text-ink-700">套餐余次</h4>
            </div>
            {summary.packages.length === 0 ? (
              <p className="rounded-xl bg-cream-100 px-4 py-3 text-xs text-ink-400">
                暂无有效套餐，可推荐办卡优惠
              </p>
            ) : (
              <div className="space-y-3">
                {summary.packages.map((p) => (
                  <div key={p.name} className="rounded-xl border border-forest-100 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-ink-700">{p.name}</span>
                      <span className="tnum text-xs text-ink-500">
                        剩余 <b className="text-forest-700">{p.remaining}</b> / {p.total} 次
                      </span>
                    </div>
                    <Progress value={p.remaining} max={p.total} barClassName="from-forest-400 to-forest-600" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 升级进度 */}
          <div className="rounded-2xl border border-gold-200 bg-gold-50/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold-600" />
                <span className="text-sm font-semibold text-ink-700">会员等级升级进度</span>
              </div>
              <span className="tnum text-xs font-medium text-ink-500">
                {upgrade ? `${Math.round((upgrade.current / (upgrade.target || 1)) * 100)}%` : ''}
              </span>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Progress
                value={upgrade ? upgrade.current : 0}
                max={upgrade && upgrade.target ? upgrade.target : 1}
                className="h-3"
              />
            </motion.div>
            <p className="mt-2 text-xs text-ink-500">
              {upgradeText}
              <span className="ml-1 text-ink-400">
                （当前 {formatCurrency(upgrade?.current ?? 0)} / 目标{' '}
                {upgrade && upgrade.target ? formatCurrency(upgrade.target) : '—'}）
              </span>
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
