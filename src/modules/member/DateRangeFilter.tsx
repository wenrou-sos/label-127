import { CalendarRange, Download } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { toDateInput } from '@/lib/format';

export interface DateRange {
  start: Date;
  end: Date;
}

type QuickKey = '7d' | 'month' | '30d' | 'all';

export function DateRangeFilter({
  value,
  quick,
  onQuick,
  onChange,
  onExport,
  exporting,
}: {
  value: DateRange;
  quick: QuickKey | null;
  onQuick: (k: QuickKey | null) => void;
  onChange: (r: DateRange) => void;
  onExport: () => void;
  exporting: boolean;
}) {
  const quicks: { key: QuickKey; label: string }[] = [
    { key: '7d', label: '近7天' },
    { key: 'month', label: '本月' },
    { key: '30d', label: '近30天' },
    { key: 'all', label: '全部' },
  ];

  return (
    <div className="surface-card flex flex-col gap-3 p-3 sm:flex-row sm:items-end sm:justify-between sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
          <CalendarRange className="h-3.5 w-3.5 text-forest-500" />
          查询区间
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {quicks.map((q) => (
            <button
              key={q.key}
              onClick={() => onQuick(q.key)}
              className={cn(
                'btn-focus rounded-full px-2.5 py-1 text-xs font-medium transition',
                quick === q.key
                  ? 'bg-forest-700 text-cream-50'
                  : 'bg-forest-50 text-forest-700 hover:bg-forest-100',
              )}
            >
              {q.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={toDateInput(value.start)}
            max={toDateInput(value.end)}
            onChange={(e) => {
              const d = e.target.value ? new Date(e.target.value) : value.start;
              onChange({ ...value, start: d });
              onQuick(null);
            }}
            className="input-base h-9 w-auto px-2 text-xs"
          />
          <span className="text-ink-300">—</span>
          <input
            type="date"
            value={toDateInput(value.end)}
            min={toDateInput(value.start)}
            onChange={(e) => {
              const d = e.target.value ? new Date(e.target.value) : value.end;
              onChange({ ...value, end: d });
              onQuick(null);
            }}
            className="input-base h-9 w-auto px-2 text-xs"
          />
        </div>
      </div>
      <Button variant="secondary" size="sm" loading={exporting} onClick={onExport} className="self-start sm:self-auto">
        <Download className="h-3.5 w-3.5" />
        导出 CSV
      </Button>
    </div>
  );
}

export function computeQuick(key: QuickKey): DateRange {
  const now = new Date();
  const end = new Date(now);
  if (key === 'all') {
    const start = new Date(2020, 0, 1);
    return { start, end };
  }
  if (key === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end };
  }
  const days = key === '7d' ? 7 : 30;
  const start = new Date(now);
  start.setDate(start.getDate() - days + 1);
  return { start, end };
}

export type { QuickKey };
