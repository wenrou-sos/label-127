import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Package, Sparkles } from 'lucide-react';
import { LevelBadge, Progress, Skeleton } from '@/components/ui';
import { Avatar } from '@/components/layout/Avatar';
import { formatCurrency, maskPhone, formatDate } from '@/lib/format';
import type { MemberSummary } from '@/lib/types';

export function MemberHeaderCard({
  summary,
  loading,
}: {
  summary: MemberSummary | null;
  loading: boolean;
}) {
  if (loading || !summary) {
    return (
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-forest-700 to-forest-800 p-5 text-cream-50">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 bg-cream-50/20" />
            <Skeleton className="h-3 w-32 bg-cream-50/20" />
          </div>
        </div>
      </div>
    );
  }

  const upgrade = summary.levelUpgrade;
  const upgradeText =
    upgrade && upgrade.nextLevel
      ? `本月再消费 ${formatCurrency(upgrade.remainingToUpgrade)} 升级 ${upgrade.nextLevel}`
      : '已达钻石会员，尽享至尊权益';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-700 to-forest-900 p-5 text-cream-50 shadow-card sm:p-6">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gold-500/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-20 h-32 w-32 rounded-full bg-forest-400/20 blur-2xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={summary.name} seed={summary.avatarSeed} size="xl" className="ring-cream-50/30" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-semibold">{summary.name}</h2>
              <LevelBadge level={summary.level} className="bg-cream-50/15 text-gold-200 ring-gold-300/30" />
            </div>
            <p className="mt-1 text-xs text-cream-100/70">
              {maskPhone(summary.phone)} · 入会 {formatDate(summary.registeredAt)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <div>
            <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-cream-100/60">
              <Wallet className="h-3 w-3" /> 储值余额
            </p>
            <p className="tnum mt-0.5 font-serif text-2xl font-semibold text-gold-200 sm:text-3xl">
              {formatCurrency(summary.balance)}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-cream-100/60">
              <TrendingUp className="h-3 w-3" /> 本月消费
            </p>
            <p className="tnum mt-0.5 font-serif text-2xl font-semibold text-cream-50 sm:text-3xl">
              {formatCurrency(summary.monthlySpent)}
            </p>
          </div>
        </div>
      </div>

      {summary.packages.length > 0 && (
        <div className="relative mt-5 flex flex-wrap gap-2">
          {summary.packages.map((p) => (
            <span
              key={p.name}
              className="inline-flex items-center gap-1.5 rounded-full bg-cream-50/10 px-3 py-1 text-xs text-cream-50 ring-1 ring-inset ring-cream-50/15"
            >
              <Package className="h-3 w-3 text-gold-300" />
              {p.name}
              <b className="tnum text-gold-200">{p.remaining}</b>/{p.total}次
            </span>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mt-5 rounded-xl bg-cream-50/10 p-3 ring-1 ring-inset ring-cream-50/15"
      >
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 text-cream-100/80">
            <Sparkles className="h-3.5 w-3.5 text-gold-300" />
            等级升级进度
          </span>
          <span className="text-cream-100/70">{upgradeText}</span>
        </div>
        <Progress
          value={upgrade ? upgrade.current : 0}
          max={upgrade && upgrade.target ? upgrade.target : 1}
          className="h-2.5 bg-cream-50/15"
        />
      </motion.div>
    </div>
  );
}
