// Mock Service：封装所有数据访问为 Promise，内置异常消费监测引擎与短信验证流程

import type {
  Member,
  MemberSummary,
  MemberLevel,
  LevelUpgrade,
  ConsumptionRecord,
  BalanceChange,
  AnomalyAlert,
  CashierStats,
  RechargeResult,
} from '../types';
import { MEMBERS, CONSUMPTION_RECORDS, BALANCE_CHANGES, STORES, NOW } from './data';
import { isSameDay, formatDate } from '../format';
import { recordsToCsv } from '../csv';

const DEMO_SMS_CODE = '1234';

function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const NEXT_LEVEL: Record<MemberLevel, MemberLevel | null> = {
  '普通': '银卡',
  '银卡': '金卡',
  '金卡': '钻石',
  '钻石': null,
};

function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function isToday(iso: string): boolean {
  return isSameDay(iso, new Date().toISOString());
}

function buildLevelUpgrade(member: Member, monthlySpent: number): LevelUpgrade {
  const nextLevel = NEXT_LEVEL[member.level];
  if (!nextLevel) {
    return { current: monthlySpent, target: 0, remainingToUpgrade: 0, nextLevel: null };
  }
  const target = member.upgradeThreshold;
  return {
    current: monthlySpent,
    target,
    remainingToUpgrade: Math.max(0, target - monthlySpent),
    nextLevel,
  };
}

export const mockService = {
  async queryMemberByPhone(phone: string): Promise<Member | null> {
    const m = MEMBERS.find((x) => x.phone === phone.trim()) ?? null;
    return delay(m, 320);
  },

  async queryMemberByCard(cardNo: string): Promise<Member | null> {
    const m = MEMBERS.find((x) => x.cardNo === cardNo.trim()) ?? null;
    return delay(m, 360);
  },

  async getMemberSummary(memberId: string): Promise<MemberSummary | null> {
    const member = MEMBERS.find((m) => m.id === memberId);
    if (!member) return delay(null);
    const records = CONSUMPTION_RECORDS.filter((r) => r.memberId === memberId);
    const monthlySpent = records.filter((r) => isThisMonth(r.date)).reduce((s, r) => s + r.total, 0);
    const totalSpent = records.reduce((s, r) => s + r.total, 0);
    const summary: MemberSummary = {
      ...member,
      monthlySpent,
      totalSpent,
      levelUpgrade: buildLevelUpgrade(member, monthlySpent),
    };
    return delay(summary);
  },

  async getConsumptionRecords(
    memberId: string,
    opts?: { range?: [Date, Date] },
  ): Promise<ConsumptionRecord[]> {
    let records = CONSUMPTION_RECORDS.filter((r) => r.memberId === memberId);
    if (opts?.range) {
      const [start, end] = opts.range;
      const s = start.getTime();
      const e = end.getTime() + 86400000;
      records = records.filter((r) => {
        const t = new Date(r.date).getTime();
        return t >= s && t < e;
      });
    }
    records = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return delay(records);
  },

  async getBalanceChanges(
    memberId: string,
    opts?: { range?: [Date, Date] },
  ): Promise<BalanceChange[]> {
    let changes = BALANCE_CHANGES.filter((r) => r.memberId === memberId);
    if (opts?.range) {
      const [start, end] = opts.range;
      const s = start.getTime();
      const e = end.getTime() + 86400000;
      changes = changes.filter((r) => {
        const t = new Date(r.date).getTime();
        return t >= s && t < e;
      });
    }
    changes = [...changes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return delay(changes);
  },

  async sendSmsCode(_phone: string): Promise<{ ok: boolean; code: string }> {
    return delay({ ok: true, code: DEMO_SMS_CODE }, 500);
  },

  async loginWithCode(
    phone: string,
    code: string,
  ): Promise<{ token: string; member: Member } | null> {
    const member = MEMBERS.find((m) => m.phone === phone.trim());
    if (!member || code !== DEMO_SMS_CODE) return delay(null, 500);
    return delay({ token: `tk_${member.id}_${Date.now()}`, member }, 520);
  },

  exportConsumptionCsv(records: ConsumptionRecord[]): Blob {
    return new Blob([recordsToCsv(records)], { type: 'text/csv;charset=utf-8;' });
  },

  // ===== 异常消费监测引擎 =====
  detectAnomalies(memberId: string): Promise<AnomalyAlert[]> {
    return delay(this.detectAnomaliesSync(memberId), 220);
  },

  detectAnomaliesSync(memberId: string): AnomalyAlert[] {
    const member = MEMBERS.find((m) => m.id === memberId);
    if (!member) return [];
    const records = CONSUMPTION_RECORDS.filter((r) => r.memberId === memberId);
    const byDay = new Map<string, ConsumptionRecord[]>();
    for (const r of records) {
      const key = formatDate(r.date);
      const arr = byDay.get(key) ?? [];
      arr.push(r);
      byDay.set(key, arr);
    }
    const alerts: AnomalyAlert[] = [];
    for (const [dayKey, dayRecords] of byDay) {
      const count = dayRecords.length;
      const sum = dayRecords.reduce((s, r) => s + r.total, 0);
      const maxSingle = Math.max(...dayRecords.map((r) => r.total));
      const dateIso = dayRecords[0].date;
      const base = {
        id: `${memberId}-${dayKey}`,
        memberId,
        memberName: member.name,
        memberPhone: member.phone,
        date: dateIso,
        recordIds: dayRecords.map((r) => r.id),
        status: '待处理' as const,
      };
      // 规则 A：同日 ≥3 笔且合计 ≥800 → 高风险
      if (count >= 3 && sum >= 800) {
        alerts.push({
          ...base,
          id: `${base.id}-A`,
          reason: `同日 ${count} 笔高频消费，合计 ¥${sum.toFixed(0)}，疑似盗刷`,
          totalAmount: sum,
          count,
          severity: '高',
        });
        continue;
      }
      // 规则 B：同日单笔 ≥1500 → 中风险
      if (maxSingle >= 1500) {
        alerts.push({
          ...base,
          id: `${base.id}-B`,
          reason: `单笔大额消费 ¥${maxSingle.toFixed(0)}，超出常规阈值`,
          totalAmount: maxSingle,
          count: 1,
          severity: '中',
        });
      }
    }
    return alerts;
  },

  async detectAllAnomalies(): Promise<AnomalyAlert[]> {
    const all = MEMBERS.flatMap((m) => this.detectAnomaliesSync(m.id)).map((a) =>
      resolvedAlerts.has(a.id) ? { ...a, status: '已解除' as const } : a,
    );
    return delay(all, 260);
  },

  async triggerSmsVerify(_memberId: string, _alertId: string): Promise<{ ok: boolean; code: string }> {
    return delay({ ok: true, code: DEMO_SMS_CODE }, 460);
  },

  async verifySmsCode(alertId: string, code: string): Promise<{ ok: boolean }> {
    if (code !== DEMO_SMS_CODE) return delay({ ok: false }, 420);
    resolvedAlerts.add(alertId);
    return delay({ ok: true }, 480);
  },

  async getCashierStats(): Promise<CashierStats> {
    const todayRecords = CONSUMPTION_RECORDS.filter((r) => isToday(r.date));
    const todayRecharges = BALANCE_CHANGES.filter((r) => r.type === '充值' && isToday(r.date));
    const todayRechargeTotal = todayRecharges.reduce((s, r) => s + r.amount, 0);
    const newMembersThisMonth = MEMBERS.filter((m) => {
      const d = new Date(m.registeredAt);
      return d >= startOfMonth();
    }).length;
    const pendingAlerts = (await this.detectAllAnomalies()).filter((a) => a.status !== '已解除').length;
    return delay({
      todayCount: todayRecords.length,
      todayRevenue: todayRecords.reduce((s, r) => s + r.total, 0) + todayRechargeTotal,
      todayRecharge: todayRechargeTotal,
      newMembersThisMonth,
      pendingAlerts,
    });
  },

  getWeeklyTrend(): Promise<{ date: string; amount: number; count: number }[]> {
    const result: { date: string; amount: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(NOW);
      d.setDate(d.getDate() - i);
      const dayStr = formatDate(d.toISOString());
      const dayRecords = CONSUMPTION_RECORDS.filter((r) => formatDate(r.date) === dayStr);
      result.push({
        date: dayStr,
        amount: dayRecords.reduce((s, r) => s + r.total, 0),
        count: dayRecords.length,
      });
    }
    return delay(result, 200);
  },

  getMemberMonthlyStats(memberId: string): Promise<{ month: string; amount: number; count: number }[]> {
    const records = CONSUMPTION_RECORDS.filter((r) => r.memberId === memberId);
    const byMonth = new Map<string, { amount: number; count: number }>();
    for (const r of records) {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const existing = byMonth.get(key) ?? { amount: 0, count: 0 };
      byMonth.set(key, { amount: existing.amount + r.total, count: existing.count + 1 });
    }
    const result = Array.from(byMonth.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
    return delay(result, 200);
  },

  getStoreStats(): Promise<{ store: string; amount: number; count: number }[]> {
    const byStore = new Map<string, { amount: number; count: number }>();
    for (const store of STORES) {
      byStore.set(store, { amount: 0, count: 0 });
    }
    for (const r of CONSUMPTION_RECORDS) {
      if (isThisMonth(r.date)) {
        const existing = byStore.get(r.store) ?? { amount: 0, count: 0 };
        byStore.set(r.store, { amount: existing.amount + r.total, count: existing.count + 1 });
      }
    }
    const result = Array.from(byStore.entries()).map(([store, data]) => ({ store, ...data }));
    return delay(result, 200);
  },

  async recharge(memberId: string, amount: number, note: string): Promise<RechargeResult> {
    const member = MEMBERS.find((m) => m.id === memberId);
    if (!member) return delay({ ok: false, error: '会员不存在' }, 400);
    if (!Number.isInteger(amount) || amount < 10 || amount > 10000) {
      return delay({ ok: false, error: '充值金额须为 10~10000 的正整数' }, 400);
    }
    const prevBalance = member.balance;
    member.balance += amount;
    const change: BalanceChange = {
      id: `B-RCHG-${Date.now()}`,
      memberId,
      date: new Date().toISOString(),
      type: '充值',
      amount,
      balanceAfter: member.balance,
      note: note || '收银台手动充值',
    };
    BALANCE_CHANGES.unshift(change);
    return delay({
      ok: true,
      newBalance: member.balance,
      prevBalance,
      amount,
      changeId: change.id,
    }, 500);
  },
};

const resolvedAlerts = new Set<string>();
