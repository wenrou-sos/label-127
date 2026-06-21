# 干洗店会员消费记录查询与统计分析面板系统 — 技术架构文档

## 1. 架构设计

系统采用纯前端单页应用架构，所有数据由内置 Mock 数据系统提供，符合用户「开发数据模拟系统」要求。前端通过分层架构组织：表现层（页面/路由）→ 业务组件层（收银端/会员端/安全预警模块）→ 基础 UI 组件库（Button/Card/Modal/Table 等）→ 数据层（类型定义 + Mock 服务 + 本地状态）。无后端服务，所有「接口」均为本地 Mock Service，便于后续替换为真实 API。

```mermaid
flowchart TD
    subgraph "表现层 Pages"
        P1 "收银端工作台 /cashier"
        P2 "会员端登录 /member/login"
        P3 "会员端首页 /member"
    end
    subgraph "业务模块层 Modules"
        M1 "收银端模块"
        M2 "会员端模块"
        M3 "安全预警模块"
    end
    subgraph "UI 组件库 ui"
        U1 "Button/Card/Modal/Input"
        U2 "Table/Badge/Progress/Tabs"
    end
    subgraph "数据层 lib"
        D1 "TypeScript 类型定义"
        D2 "Mock 数据"
        D3 "Mock Service + 异常监测引擎"
    end
    P1 --> M1
    P1 --> M3
    P2 --> M2
    P3 --> M2
    M1 --> U1
    M1 --> U2
    M2 --> U1
    M2 --> U2
    M3 --> U1
    M1 --> D3
    M2 --> D3
    M3 --> D3
    D3 --> D2
    D2 --> D1
```

## 2. 技术描述

- **前端框架**：React 18 + TypeScript（严格模式）
- **构建工具**：Vite 5
- **样式方案**：Tailwind CSS 3（桌面优先 + 响应式断点）
- **UI 组件库**：自建轻量组件库 `src/components/ui`（保证设计一致性与完全的视觉控制力），图标使用 `lucide-react`
- **动效**：`framer-motion`（弹窗/错峰渐显/预警脉冲）
- **路由**：`react-router-dom` v6
- **数据可视化**：纯 CSS/SVG（进度条、时间轴、统计卡），不引入重型图表库
- **数据模拟系统**：`src/lib/mock` 下提供类型化 Mock 数据与 Mock Service，封装为 Promise 模拟异步
- **无后端 / 无数据库**：所有数据存储于内存，会员登录态用 React Context + localStorage 持久化

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 重定向至 `/cashier`（默认收银端） |
| `/cashier` | 收银端工作台：会员核验、信息卡弹窗、消费明细、安全预警 |
| `/member/login` | 会员端登录认证 |
| `/member` | 会员端首页：消费流水、余额变动、日期筛选、导出（需登录守卫） |

## 4. Mock Service 接口定义（本地）

所有接口返回 `Promise<T>`，模拟 200~600ms 延迟。核心接口：

```typescript
// 会员核验
queryMemberByPhone(phone: string): Promise<Member | null>
queryMemberByCard(cardNo: string): Promise<Member | null>

// 会员信息聚合
getMemberSummary(memberId: string): Promise<MemberSummary>
getConsumptionRecords(memberId: string, opts?: { range?: [Date, Date] }): Promise<ConsumptionRecord[]>
getBalanceChanges(memberId: string, opts?: { range?: [Date, Date] }): Promise<BalanceChange[]>

// 会员端登录
sendSmsCode(phone: string): Promise<{ ok: boolean }>
loginWithCode(phone: string, code: string): Promise<{ token: string; member: Member } | null>

// 导出
exportConsumptionCsv(memberId: string, range?: [Date, Date]): Blob

// 安全预警
detectAnomalies(memberId: string): Promise<AnomalyAlert[]>
triggerSmsVerify(memberId: string, alertId: string): Promise<{ ok: boolean }>
verifySmsCode(memberId: string, code: string): Promise<{ ok: boolean }>
```

## 5. 核心类型定义

```typescript
type MemberLevel = '普通' | '银卡' | '金卡' | '钻石';
type PaymentMethod = '储值扣款' | '套餐扣次' | '现金补差';
type BalanceChangeType = '充值' | '消费' | '退款' | '过期';

interface Member {
  id: string; name: string; phone: string; cardNo: string;
  level: MemberLevel; balance: number;
  packages: { name: string; remaining: number; total: number }[];
  avatarSeed: string; registeredAt: string; monthlySpent: number;
  levelUpgrade: { current: number; target: number; remainingToUpgrade: number; nextLevel: MemberLevel | null };
}
interface ConsumptionRecord {
  id: string; memberId: string; date: string; store: string;
  items: { name: string; qty: number; price: number }[]; total: number;
  paymentMethod: PaymentMethod; deductedAmount: number;
}
interface BalanceChange {
  id: string; memberId: string; date: string; type: BalanceChangeType;
  amount: number; balanceAfter: number; note: string;
}
interface AnomalyAlert {
  id: string; memberId: string; memberName: string; date: string;
  reason: string; totalAmount: number; count: number; severity: '高' | '中';
  status: '待处理' | '验证中' | '已解除';
}
```

## 6. 异常消费监测引擎规则

「同日频繁大额消费疑似盗刷」监测逻辑（位于 `detectAnomalies`）：
- 规则 A：同一会员同一自然日内消费笔数 ≥ 3 笔且合计金额 ≥ 800 元 → 高风险
- 规则 B：同一会员同一自然日内单笔金额 ≥ 1500 元 → 中风险
- 命中规则后生成 `AnomalyAlert`，收银端预警侧栏高亮，点击触发短信验证流程（`triggerSmsVerify` → 弹窗输入验证码 → `verifySmsCode` 校验）。

## 7. 目录结构

```
src/
  main.tsx                # 应用入口
  App.tsx                 # 路由与全局 Provider
  index.css               # Tailwind + 设计令牌 + 字体
  components/
    ui/                   # 自建 UI 组件库
      button.tsx card.tsx modal.tsx input.tsx badge.tsx
      progress.tsx table.tsx tabs.tsx toast.tsx
    layout/               # 通用布局（侧栏/品牌栏）
  modules/
    cashier/              # 收银端业务组件
    member/               # 会员端业务组件
    security/             # 安全预警业务组件
  pages/
    CashierPage.tsx
    member/MemberLoginPage.tsx
    member/MemberPage.tsx
  lib/
    types.ts              # 全局类型定义
    mock/data.ts          # Mock 数据
    mock/service.ts       # Mock Service + 异常监测引擎
    csv.ts                # CSV 导出工具
    auth.tsx              # 会员登录 Context
```
