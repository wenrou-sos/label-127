import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { MemberLevel, PaymentMethod, BalanceChangeType, AlertStatus } from '@/lib/types';

export type BadgeTone = 'forest' | 'gold' | 'brick' | 'slate' | 'cream';

const toneStyles: Record<BadgeTone, string> = {
  forest: 'bg-forest-50 text-forest-700 ring-forest-200',
  gold: 'bg-gold-50 text-gold-700 ring-gold-200',
  brick: 'bg-brick-50 text-brick-600 ring-brick-200',
  slate: 'bg-ink-100 text-ink-600 ring-ink-200',
  cream: 'bg-cream-200 text-ink-700 ring-cream-300',
};

export function Badge({
  tone = 'forest',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const levelTone: Record<MemberLevel, BadgeTone> = {
  普通: 'slate',
  银卡: 'cream',
  金卡: 'gold',
  钻石: 'forest',
};

export function LevelBadge({ level, className }: { level: MemberLevel; className?: string }) {
  return (
    <Badge tone={levelTone[level]} className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {level}会员
    </Badge>
  );
}

const paymentTone: Record<PaymentMethod, BadgeTone> = {
  储值扣款: 'forest',
  套餐扣次: 'gold',
  现金补差: 'slate',
};

export function PaymentBadge({ method, className }: { method: PaymentMethod; className?: string }) {
  return (
    <Badge tone={paymentTone[method]} className={className}>
      {method}
    </Badge>
  );
}

const changeTone: Record<BalanceChangeType, BadgeTone> = {
  充值: 'forest',
  消费: 'brick',
  退款: 'gold',
  过期: 'slate',
};

export function ChangeTypeBadge({ type, className }: { type: BalanceChangeType; className?: string }) {
  return (
    <Badge tone={changeTone[type]} className={className}>
      {type}
    </Badge>
  );
}

const statusTone: Record<AlertStatus, BadgeTone> = {
  待处理: 'brick',
  验证中: 'gold',
  已解除: 'slate',
};

export function AlertStatusBadge({ status, className }: { status: AlertStatus; className?: string }) {
  return (
    <Badge tone={statusTone[status]} className={className}>
      {status}
    </Badge>
  );
}

export function SectionTag({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-600',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
