// 会员等级、扣款方式、余额变动类型等全局类型定义

export type MemberLevel = '普通' | '银卡' | '金卡' | '钻石';

export type PaymentMethod = '储值扣款' | '套餐扣次' | '现金补差';

export type BalanceChangeType = '充值' | '消费' | '退款' | '过期';

export type AlertSeverity = '高' | '中';

export type AlertStatus = '待处理' | '验证中' | '已解除';

export interface MemberPackage {
  name: string;
  remaining: number;
  total: number;
}

export interface LevelUpgrade {
  current: number;
  target: number;
  remainingToUpgrade: number;
  nextLevel: MemberLevel | null;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  cardNo: string;
  level: MemberLevel;
  balance: number;
  packages: MemberPackage[];
  avatarSeed: string;
  registeredAt: string;
  upgradeThreshold: number;
}

export interface MemberSummary extends Member {
  monthlySpent: number;
  totalSpent: number;
  levelUpgrade: LevelUpgrade;
}

export interface ConsumptionItem {
  name: string;
  qty: number;
  price: number;
}

export interface ConsumptionRecord {
  id: string;
  memberId: string;
  date: string;
  store: string;
  items: ConsumptionItem[];
  total: number;
  paymentMethod: PaymentMethod;
  deductedAmount: number;
}

export interface BalanceChange {
  id: string;
  memberId: string;
  date: string;
  type: BalanceChangeType;
  amount: number;
  balanceAfter: number;
  note: string;
}

export interface AnomalyAlert {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  date: string;
  reason: string;
  totalAmount: number;
  count: number;
  severity: AlertSeverity;
  status: AlertStatus;
  recordIds: string[];
}

export interface CashierStats {
  todayCount: number;
  todayRevenue: number;
  newMembersThisMonth: number;
  pendingAlerts: number;
}
