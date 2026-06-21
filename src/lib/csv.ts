// CSV 导出工具：将消费记录转为 CSV 并触发下载

import type { ConsumptionRecord } from './types';
import { formatDate } from './format';

function escapeCell(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function recordsToCsv(records: ConsumptionRecord[]): string {
  const header = ['消费日期', '消费门店', '消费项目', '合计金额', '扣款方式', '扣款金额'];
  const rows = records.map((r) => {
    const itemsText = r.items.map((i) => `${i.name}×${i.qty}`).join('+');
    return [
      formatDate(r.date, true),
      r.store,
      itemsText,
      r.total.toFixed(2),
      r.paymentMethod,
      r.deductedAmount.toFixed(2),
    ].map(escapeCell).join(',');
  });
  return '\ufeff' + [header.join(','), ...rows].join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
