// Mock 数据：会员、消费记录、余额变动。日期相对「今天」动态生成，保证本月累计与日期筛选真实可用。
// 支持 localStorage 持久化，确保充值等操作在刷新后仍然有效。

import type {
  Member,
  ConsumptionRecord,
  BalanceChange,
} from '../types';

export const NOW = new Date();

const STORAGE_KEY = 'jingzhi-mock-data';
const STORAGE_VERSION = 2;

function iso(daysAgo: number, hour = 10, min = 0): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

export const STORES = [
  '净致干洗 · 静安旗舰店',
  '净致干洗 · 徐汇宛平店',
  '净致干洗 · 浦东陆家嘴店',
  '净致干洗 · 黄浦外滩店',
];

const STORE_STORAGE_KEY = 'jingzhi-current-store';

export let currentStore: string = STORES[0];

export function getCurrentStore(): string {
  return currentStore;
}

export function setCurrentStore(store: string): void {
  if (!STORES.includes(store)) return;
  currentStore = store;
  try {
    localStorage.setItem(STORE_STORAGE_KEY, store);
  } catch {
    // ignore
  }
  notifyListeners();
}

const SEED_MEMBERS: Member[] = [
  {
    id: 'M001',
    name: '林婉清',
    phone: '13812345678',
    cardNo: 'VC20240001',
    level: '金卡',
    balance: 1560.0,
    packages: [
      { name: '羽绒服精护套餐', remaining: 3, total: 5 },
      { name: '大衣养护套餐', remaining: 2, total: 4 },
    ],
    avatarSeed: 'lin',
    registeredAt: iso(820, 14),
    registeredStore: STORES[0],
    upgradeThreshold: 3000,
  },
  {
    id: 'M002',
    name: '周梓涵',
    phone: '13900001111',
    cardNo: 'VC20240002',
    level: '银卡',
    balance: 820.5,
    packages: [{ name: '衬衫水洗月卡', remaining: 12, total: 20 }],
    avatarSeed: 'zhou',
    registeredAt: iso(540, 11),
    registeredStore: STORES[2],
    upgradeThreshold: 1500,
  },
  {
    id: 'M003',
    name: '王建华',
    phone: '13700002222',
    cardNo: 'VC20240003',
    level: '普通',
    balance: 120.0,
    packages: [],
    avatarSeed: 'wang',
    registeredAt: iso(95, 15),
    registeredStore: STORES[3],
    upgradeThreshold: 500,
  },
  {
    id: 'M004',
    name: '赵雅琴',
    phone: '13600003333',
    cardNo: 'VC20240004',
    level: '钻石',
    balance: 6480.0,
    packages: [
      { name: '高端皮具养护套餐', remaining: 5, total: 8 },
      { name: '窗帘床品清洗套餐', remaining: 4, total: 6 },
    ],
    avatarSeed: 'zhao',
    registeredAt: iso(1200, 9),
    registeredStore: STORES[0],
    upgradeThreshold: 0,
  },
  {
    id: 'M005',
    name: '孙志远',
    phone: '13500004444',
    cardNo: 'VC20240005',
    level: '金卡',
    balance: 2340.0,
    packages: [{ name: '西装精护套餐', remaining: 6, total: 10 }],
    avatarSeed: 'sun',
    registeredAt: iso(700, 16),
    registeredStore: STORES[0],
    upgradeThreshold: 3000,
  },
  {
    id: 'M006',
    name: '吴美玲',
    phone: '13400005555',
    cardNo: 'VC20240006',
    level: '银卡',
    balance: 460.0,
    packages: [{ name: '床品护理套餐', remaining: 1, total: 4 }],
    avatarSeed: 'wu',
    registeredAt: iso(410, 13),
    registeredStore: STORES[3],
    upgradeThreshold: 1500,
  },
  {
    id: 'M007',
    name: '陈思远',
    phone: '13300006666',
    cardNo: 'VC20240007',
    level: '普通',
    balance: 500.0,
    packages: [],
    avatarSeed: 'chen',
    registeredAt: iso(0, 9, 30),
    registeredStore: STORES[1],
    upgradeThreshold: 500,
  },
];

const SEED_CONSUMPTION_RECORDS: ConsumptionRecord[] = [
  // ===== M001 林婉清：今日 3 笔高频消费（触发规则 A，高风险） =====
  {
    id: 'C001', memberId: 'M001', date: iso(0, 9, 12), store: STORES[0],
    items: [{ name: '羽绒服干洗', qty: 2, price: 80 }, { name: '大衣干洗', qty: 1, price: 65 }],
    total: 225, paymentMethod: '储值扣款', deductedAmount: 225,
  },
  {
    id: 'C002', memberId: 'M001', date: iso(0, 13, 40), store: STORES[0],
    items: [{ name: '床品护理', qty: 1, price: 120 }, { name: '衬衫水洗', qty: 3, price: 15 }],
    total: 165, paymentMethod: '套餐扣次', deductedAmount: 0,
  },
  {
    id: 'C003', memberId: 'M001', date: iso(0, 17, 5), store: STORES[0],
    items: [{ name: '窗帘清洗', qty: 3, price: 150 }],
    total: 450, paymentMethod: '储值扣款', deductedAmount: 450,
  },
  // 本月更早消费
  {
    id: 'C004', memberId: 'M001', date: iso(2, 11, 20), store: STORES[1],
    items: [{ name: '西装干洗', qty: 2, price: 55 }, { name: '衬衫水洗', qty: 2, price: 15 }],
    total: 140, paymentMethod: '储值扣款', deductedAmount: 140,
  },
  {
    id: 'C005', memberId: 'M001', date: iso(5, 15, 0), store: STORES[0],
    items: [{ name: '沙发套清洗', qty: 1, price: 180 }],
    total: 180, paymentMethod: '现金补差', deductedAmount: 80,
  },
  {
    id: 'C006', memberId: 'M001', date: iso(9, 10, 30), store: STORES[2],
    items: [{ name: '大衣干洗', qty: 1, price: 65 }, { name: '羽绒服干洗', qty: 1, price: 80 }],
    total: 145, paymentMethod: '储值扣款', deductedAmount: 145,
  },
  {
    id: 'C007', memberId: 'M001', date: iso(12, 16, 10), store: STORES[0],
    items: [{ name: '婚沙礼服护理', qty: 1, price: 380 }],
    total: 380, paymentMethod: '储值扣款', deductedAmount: 380,
  },
  {
    id: 'C008', memberId: 'M001', date: iso(16, 14, 25), store: STORES[1],
    items: [{ name: '鞋类护理', qty: 2, price: 45 }],
    total: 90, paymentMethod: '套餐扣次', deductedAmount: 0,
  },
  // 上月记录
  {
    id: 'C009', memberId: 'M001', date: iso(35, 11, 0), store: STORES[0],
    items: [{ name: '羽绒服干洗', qty: 3, price: 80 }],
    total: 240, paymentMethod: '储值扣款', deductedAmount: 240,
  },
  {
    id: 'C010', memberId: 'M001', date: iso(48, 9, 50), store: STORES[3],
    items: [{ name: '皮衣护理', qty: 1, price: 280 }],
    total: 280, paymentMethod: '储值扣款', deductedAmount: 280,
  },

  // ===== M002 周梓涵：今日单笔大额（触发规则 B，中风险） =====
  {
    id: 'C011', memberId: 'M002', date: iso(0, 10, 30), store: STORES[2],
    items: [{ name: '高档皮衣护理', qty: 3, price: 560 }],
    total: 1680, paymentMethod: '储值扣款', deductedAmount: 1680,
  },
  {
    id: 'C012', memberId: 'M002', date: iso(4, 15, 0), store: STORES[1],
    items: [{ name: '衬衫水洗', qty: 5, price: 15 }],
    total: 75, paymentMethod: '套餐扣次', deductedAmount: 0,
  },
  {
    id: 'C013', memberId: 'M002', date: iso(11, 12, 18), store: STORES[2],
    items: [{ name: '西装干洗', qty: 1, price: 55 }],
    total: 55, paymentMethod: '储值扣款', deductedAmount: 55,
  },
  {
    id: 'C014', memberId: 'M002', date: iso(30, 16, 40), store: STORES[0],
    items: [{ name: '大衣干洗', qty: 1, price: 65 }],
    total: 65, paymentMethod: '现金补差', deductedAmount: 65,
  },

  // ===== M003 王建华 =====
  {
    id: 'C015', memberId: 'M003', date: iso(1, 14, 0), store: STORES[3],
    items: [{ name: '衬衫水洗', qty: 4, price: 15 }],
    total: 60, paymentMethod: '现金补差', deductedAmount: 60,
  },
  {
    id: 'C016', memberId: 'M003', date: iso(8, 10, 15), store: STORES[3],
    items: [{ name: '大衣干洗', qty: 1, price: 65 }],
    total: 65, paymentMethod: '储值扣款', deductedAmount: 65,
  },
  {
    id: 'C017', memberId: 'M003', date: iso(22, 17, 30), store: STORES[2],
    items: [{ name: '鞋类护理', qty: 1, price: 45 }],
    total: 45, paymentMethod: '现金补差', deductedAmount: 45,
  },

  // ===== M004 赵雅琴（钻石，正常高频但小额，不触发） =====
  {
    id: 'C018', memberId: 'M004', date: iso(0, 11, 5), store: STORES[0],
    items: [{ name: '高端皮具养护', qty: 1, price: 320 }],
    total: 320, paymentMethod: '储值扣款', deductedAmount: 320,
  },
  {
    id: 'C019', memberId: 'M004', date: iso(3, 15, 20), store: STORES[1],
    items: [{ name: '窗帘清洗', qty: 2, price: 150 }],
    total: 300, paymentMethod: '套餐扣次', deductedAmount: 0,
  },
  {
    id: 'C020', memberId: 'M004', date: iso(10, 9, 40), store: STORES[0],
    items: [{ name: '沙发套清洗', qty: 1, price: 180 }],
    total: 180, paymentMethod: '储值扣款', deductedAmount: 180,
  },

  // ===== M005 孙志远 =====
  {
    id: 'C021', memberId: 'M005', date: iso(2, 16, 0), store: STORES[2],
    items: [{ name: '西装干洗', qty: 2, price: 55 }],
    total: 110, paymentMethod: '套餐扣次', deductedAmount: 0,
  },
  {
    id: 'C022', memberId: 'M005', date: iso(6, 11, 30), store: STORES[0],
    items: [{ name: '羽绒服干洗', qty: 1, price: 80 }],
    total: 80, paymentMethod: '储值扣款', deductedAmount: 80,
  },
  {
    id: 'C023', memberId: 'M005', date: iso(40, 14, 10), store: STORES[1],
    items: [{ name: '大衣干洗', qty: 2, price: 65 }],
    total: 130, paymentMethod: '储值扣款', deductedAmount: 130,
  },

  // ===== M006 吴美玲 =====
  {
    id: 'C024', memberId: 'M006', date: iso(1, 13, 50), store: STORES[3],
    items: [{ name: '床品护理', qty: 1, price: 120 }],
    total: 120, paymentMethod: '套餐扣次', deductedAmount: 0,
  },
  {
    id: 'C025', memberId: 'M006', date: iso(14, 10, 0), store: STORES[3],
    items: [{ name: '衬衫水洗', qty: 3, price: 15 }],
    total: 45, paymentMethod: '现金补差', deductedAmount: 45,
  },
];

const SEED_BALANCE_CHANGES: BalanceChange[] = [
  // M001
  { id: 'B001', memberId: 'M001', date: iso(0, 9, 12), type: '消费', amount: -225, balanceAfter: 1560.0, note: '羽绒服+大衣干洗（静安旗舰店）', store: STORES[0] },
  { id: 'B002', memberId: 'M001', date: iso(0, 17, 6), type: '消费', amount: -450, balanceAfter: 1560.0, note: '窗帘清洗×3', store: STORES[0] },
  { id: 'B003', memberId: 'M001', date: iso(2, 11, 21), type: '消费', amount: -140, balanceAfter: 2085.0, note: '西装+衬衫干洗', store: STORES[1] },
  { id: 'B004', memberId: 'M001', date: iso(5, 10, 0), type: '充值', amount: 1000, balanceAfter: 2225.0, note: '充值赠送 100 元（满 1000 送 100）', store: STORES[0] },
  { id: 'B005', memberId: 'M001', date: iso(9, 10, 31), type: '消费', amount: -145, balanceAfter: 1225.0, note: '大衣+羽绒服干洗', store: STORES[2] },
  { id: 'B006', memberId: 'M001', date: iso(12, 16, 11), type: '消费', amount: -380, balanceAfter: 1370.0, note: '婚纱礼服护理', store: STORES[0] },
  { id: 'B007', memberId: 'M001', date: iso(20, 9, 0), type: '退款', amount: 65, balanceAfter: 1750.0, note: '大衣干洗质量瑕疵退款', store: STORES[0] },
  { id: 'B008', memberId: 'M001', date: iso(45, 8, 30), type: '过期', amount: -200, balanceAfter: 1450.0, note: '上季度赠送余额过期清零', store: STORES[0] },
  // M002
  { id: 'B009', memberId: 'M002', date: iso(0, 10, 31), type: '消费', amount: -1680, balanceAfter: 820.5, note: '高档皮衣护理×3', store: STORES[2] },
  { id: 'B010', memberId: 'M002', date: iso(7, 14, 0), type: '充值', amount: 2000, balanceAfter: 2500.5, note: '银卡升级充值', store: STORES[2] },
  { id: 'B011', memberId: 'M002', date: iso(30, 16, 41), type: '消费', amount: -65, balanceAfter: 500.5, note: '大衣干洗', store: STORES[0] },
  // M003
  { id: 'B012', memberId: 'M003', date: iso(8, 10, 16), type: '消费', amount: -65, balanceAfter: 120.0, note: '大衣干洗', store: STORES[3] },
  { id: 'B013', memberId: 'M003', date: iso(15, 9, 0), type: '充值', amount: 300, balanceAfter: 185.0, note: '新会员首充 300', store: STORES[3] },
  // M004
  { id: 'B014', memberId: 'M004', date: iso(0, 11, 6), type: '消费', amount: -320, balanceAfter: 6480.0, note: '高端皮具养护', store: STORES[0] },
  { id: 'B015', memberId: 'M004', date: iso(4, 13, 0), type: '充值', amount: 5000, balanceAfter: 6800.0, note: '钻石会员续费充值', store: STORES[0] },
  { id: 'B016', memberId: 'M004', date: iso(60, 8, 0), type: '过期', amount: -500, balanceAfter: 1800.0, note: '年度赠送余额过期', store: STORES[0] },
  // M007（今日徐汇宛平店新会员首充，用于校验门店隔离）
  { id: 'B017', memberId: 'M007', date: iso(0, 9, 35), type: '充值', amount: 500, balanceAfter: 500.0, note: '新会员首充 500', store: STORES[1] },
];

export let MEMBERS: Member[] = [];
export let CONSUMPTION_RECORDS: ConsumptionRecord[] = [];
export let BALANCE_CHANGES: BalanceChange[] = [];

type StorageData = {
  version: number;
  members: Member[];
  consumptionRecords: ConsumptionRecord[];
  balanceChanges: BalanceChange[];
};

type ChangeListener = () => void;
const listeners = new Set<ChangeListener>();

export function subscribeToDataChanges(listener: ChangeListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach((fn) => {
    try { fn(); } catch { /* ignore */ }
  });
}

export function saveToStorage() {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      members: MEMBERS,
      consumptionRecords: CONSUMPTION_RECORDS,
      balanceChanges: BALANCE_CHANGES,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as StorageData;
      if (data.version === STORAGE_VERSION) {
        MEMBERS = data.members;
        CONSUMPTION_RECORDS = data.consumptionRecords;
        BALANCE_CHANGES = data.balanceChanges;
        return true;
      }
    }
  } catch {
    // ignore parse errors
  }
  MEMBERS = JSON.parse(JSON.stringify(SEED_MEMBERS));
  CONSUMPTION_RECORDS = JSON.parse(JSON.stringify(SEED_CONSUMPTION_RECORDS));
  BALANCE_CHANGES = JSON.parse(JSON.stringify(SEED_BALANCE_CHANGES));
  return false;
}

export function resetToSeed() {
  MEMBERS = JSON.parse(JSON.stringify(SEED_MEMBERS));
  CONSUMPTION_RECORDS = JSON.parse(JSON.stringify(SEED_CONSUMPTION_RECORDS));
  BALANCE_CHANGES = JSON.parse(JSON.stringify(SEED_BALANCE_CHANGES));
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
  notifyListeners();
}

if (typeof window !== 'undefined') {
  loadFromStorage();
  try {
    const savedStore = localStorage.getItem(STORE_STORAGE_KEY);
    if (savedStore && STORES.includes(savedStore)) {
      currentStore = savedStore;
    }
  } catch {
    // ignore
  }
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      loadFromStorage();
      notifyListeners();
    }
    if (e.key === STORE_STORAGE_KEY && e.newValue && STORES.includes(e.newValue)) {
      currentStore = e.newValue;
      notifyListeners();
    }
  });
}
