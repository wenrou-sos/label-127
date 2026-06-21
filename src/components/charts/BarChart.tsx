import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BarChartDataPoint {
  label: string;
  value: number;
  subLabel?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  color?: string;
  className?: string;
  formatValue?: (v: number) => string;
}

export function BarChart({
  data,
  height = 160,
  color = '#2d5a4a',
  className,
  formatValue = (v) => v.toString(),
}: BarChartProps) {
  const { bars, maxValue } = useMemo(() => {
    if (data.length === 0) {
      return { bars: [], maxValue: 0 };
    }
    const values = data.map((d) => d.value);
    const max = Math.max(...values) || 1;
    const padding = { top: 16, bottom: 28 };
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = 100 / (data.length * 2.5);

    const b = data.map((d, i) => {
      const h = (d.value / max) * chartHeight;
      const x = barWidth + i * (100 / data.length);
      const y = padding.top + chartHeight - h;
      return { x, y, width: barWidth * 1.5, height: h, value: d.value, label: d.label, subLabel: d.subLabel };
    });

    return { bars: b, maxValue: max };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-xs text-ink-300">暂无数据</p>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full', className)}>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full">
        <line x1="0" y1={height - 28} x2="100" y2={height - 28} stroke="#e8edea" strokeWidth="0.3" />

        {bars.map((bar, i) => (
          <g key={i}>
            <motion.rect
              x={bar.x - bar.width / 2}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx="1.5"
              fill={color}
              initial={{ height: 0, y: height - 28 }}
              animate={{ height: bar.height, y: bar.y }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
            />
            <text
              x={bar.x}
              y={bar.y - 3}
              fontSize="3.5"
              fill="#374151"
              textAnchor="middle"
              fontWeight="500"
            >
              {formatValue(bar.value)}
            </text>
            <text
              x={bar.x}
              y={height - 14}
              fontSize="3.5"
              fill="#6b7280"
              textAnchor="middle"
            >
              {bar.label}
            </text>
            {bar.subLabel && (
              <text
                x={bar.x}
                y={height - 6}
                fontSize="2.8"
                fill="#9ca3af"
                textAnchor="middle"
              >
                {bar.subLabel}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
